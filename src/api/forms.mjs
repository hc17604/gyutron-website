/**
 * Form submission API: POST /api/rfq, /api/support, /api/download-request.
 * (POST /api/contact stays in contact-handler.mjs to preserve its exact email
 *  behavior; it shares the same persistence + event pipeline via db/submit.mjs.)
 *
 * Pipeline: method → parse → honeypot → Turnstile → rate-limit → validate →
 *           persist to D1 → emit event → thank-you JSON.
 * Every external dependency degrades gracefully when unconfigured.
 */
import { FORMS } from "../platform/schemas.mjs";
import { validateForm, normalizeMeta, isHoneypotTripped } from "../platform/validate.mjs";
import { requestContext } from "../platform/request.mjs";
import { getDb } from "../platform/db/client.mjs";
import { recordSubmission } from "../platform/db/submit.mjs";
import { verifyTurnstile } from "../platform/security/turnstile.mjs";
import { rateLimit } from "../platform/security/ratelimit.mjs";
import { formOk, formError, json } from "../platform/response.mjs";

const THANKYOU = "Thanks. Your request has been received — the GYUTRON team will follow up by email.";

function turnstileToken(payload) {
  return payload["cf-turnstile-response"] || payload.turnstileToken || payload.turnstile || "";
}

/** @param {"rfq"|"support"|"download"} formKey */
export async function handleFormRequest(formKey, request, env, _ctx) {
  if (request.method === "OPTIONS") {
    return json({ ok: true }, 204, {
      allow: "POST, OPTIONS",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type",
    });
  }
  if (request.method !== "POST") {
    return json({ ok: false, message: "Method not allowed." }, 405, { allow: "POST, OPTIONS" });
  }

  const spec = FORMS[formKey];
  if (!spec) return formError("Unknown form.", 404);

  let payload;
  try {
    payload = await request.json();
  } catch {
    return formError("Please submit the form again.", 400);
  }
  if (typeof payload !== "object" || payload === null) {
    return formError("Please submit the form again.", 400);
  }

  // Honeypot: silently accept so bots get no signal.
  if (isHoneypotTripped(payload)) return formOk(THANKYOU);

  const reqCtx = await requestContext(request, env);

  // Anti-spam (skipped gracefully if Turnstile secret not set).
  const ts = await verifyTurnstile(env, turnstileToken(payload), reqCtx.ip);
  if (!ts.ok) return formError("Anti-spam verification failed. Please reload and try again.", 400);

  // Rate limit (skipped gracefully without a KV binding).
  const rl = await rateLimit(env, `${formKey}:${reqCtx.ip_hash || reqCtx.ip || "anon"}`, {
    limit: 8,
    windowSeconds: 60,
  });
  if (!rl.ok) {
    return json({ ok: false, message: "Too many submissions. Please try again shortly." }, 429, {
      "retry-after": String(rl.retryAfter || 60),
    });
  }

  // Validate against the form schema.
  const { ok, value, errors } = validateForm(spec, payload);
  if (!ok) return formError("Please check the highlighted fields.", 400, { errors });

  // Assemble the row.
  const now = new Date().toISOString();
  const row = {
    ...value,
    ...normalizeMeta(payload),
    user_agent: reqCtx.user_agent,
    ip_hash: reqCtx.ip_hash,
    ip_country: reqCtx.ip_country,
    status: "new",
    created_at: now,
    updated_at: now,
  };
  // access_type is a server-side policy decision, never client-supplied.
  if (formKey === "download") row.access_type = "manual_review";

  const db = getDb(env);
  if (!db) {
    // No data store yet → we cannot persist and (Phase 1) don't email these forms.
    return formError("This request channel is being set up. Please email info@gyutron.com.", 503);
  }

  try {
    const { publicId } = await recordSubmission(db, env, {
      table: spec.table,
      idPrefix: spec.idPrefix,
      row,
      eventType: spec.eventType,
      entityType: spec.entityType,
      eventPayload: {
        company: row.company || null,
        email: row.email || null,
        locale: row.locale || null,
        source_page: row.source_page || null,
      },
    });
    return formOk(THANKYOU, { id: publicId });
  } catch (e) {
    console.error(`${formKey} submission failed:`, e && e.message);
    return formError("We couldn't save your request right now. Please email info@gyutron.com.", 500);
  }
}
