import { getDb } from "./platform/db/client.mjs";
import { recordSubmission } from "./platform/db/submit.mjs";
import { requestContext as submissionContext } from "./platform/request.mjs";
import { normalizeMeta } from "./platform/validate.mjs";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

export async function handleContactRequest(request, env = {}) {
  if (request.method === "OPTIONS") {
    return json({ ok: true }, 204, {
      allow: "POST, OPTIONS",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type",
    });
  }

  if (request.method !== "POST") {
    return json({ ok: false, message: "Method not allowed." }, 405, {
      allow: "POST, OPTIONS",
    });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, message: "Please submit the form again." }, 400);
  }
  if (typeof payload !== "object" || payload === null) {
    return json({ ok: false, message: "Please submit the form again." }, 400);
  }

  const inquiry = normalizeInquiry(payload);
  if (inquiry.website) {
    return json({ ok: true, message: "Thanks. Your inquiry has been received." });
  }

  const validationError = validateInquiry(inquiry);
  if (validationError) {
    return json({ ok: false, message: validationError }, 400);
  }

  // 1) Persist to D1 as the system of record (best-effort; lands in the events
  //    stream too). Degrades silently if no DB is bound yet.
  let publicId = null;
  const db = getDb(env);
  if (db) {
    try {
      const ctx = await submissionContext(request, env);
      const meta = normalizeMeta(payload);
      const now = new Date().toISOString();
      const leadRow = {
        type: "contact_sales",
        name: inquiry.fullName,
        company: inquiry.company,
        email: inquiry.workEmail,
        phone: inquiry.phone || null,
        country: inquiry.country || null,
        product_interest: inquiry.productInterest || null,
        message: inquiry.projectDetails,
        source_page: meta.source_page || "/contact-sales.html",
        locale: meta.locale || null,
        utm_source: meta.utm_source || null,
        utm_medium: meta.utm_medium || null,
        utm_campaign: meta.utm_campaign || null,
        user_agent: ctx.user_agent,
        ip_hash: ctx.ip_hash,
        ip_country: ctx.ip_country,
        status: "new",
        created_at: now,
        updated_at: now,
      };
      const res = await recordSubmission(db, env, {
        table: "leads",
        idPrefix: "LEAD",
        row: leadRow,
        eventType: "lead.created",
        entityType: "lead",
        eventPayload: {
          company: leadRow.company,
          email: leadRow.email,
          product_interest: leadRow.product_interest,
          locale: leadRow.locale,
          source_page: leadRow.source_page,
        },
      });
      publicId = res.publicId;
    } catch (e) {
      console.error("contact persist failed:", e && e.message);
    }
  }

  // 2) Email notification via Resend (best-effort — keeps the existing behavior).
  const toEmail = env.CONTACT_TO_EMAIL || "info@gyutron.com";
  const fromEmail = env.CONTACT_FROM_EMAIL;
  const resendApiKey = env.RESEND_API_KEY;
  const emailConfigured = Boolean(resendApiKey && fromEmail);
  let emailId = null;
  let emailed = false;
  if (emailConfigured) {
    const sent = await sendWithResend({ apiKey: resendApiKey, from: fromEmail, to: toEmail, inquiry, request });
    emailed = sent.ok;
    emailId = sent.id || null;
  }

  // 3) Success if the lead was captured anywhere (DB or email). Distinguish a
  //    configured-but-failed email (502, transient) from nothing configured (503),
  //    so we never tell the user "not configured" when it actually is.
  if (!publicId && !emailed) {
    if (emailConfigured) {
      return json(
        {
          ok: false,
          message: "The inquiry could not be sent right now. Please email info@gyutron.com or use WhatsApp.",
        },
        502,
      );
    }
    return json(
      {
        ok: false,
        message: "The contact service is not configured yet. Please email info@gyutron.com or use WhatsApp.",
      },
      503,
    );
  }

  return json({
    ok: true,
    message: "Thanks. Your inquiry has been sent to the GYUTRON sales team.",
    id: publicId || emailId,
  });
}

function normalizeInquiry(payload) {
  return {
    fullName: clean(payload.fullName || payload["Full name"]),
    company: clean(payload.company || payload.Company),
    workEmail: clean(payload.workEmail || payload["Work email"]).toLowerCase(),
    phone: clean(payload.phone || payload["Phone or WhatsApp"]),
    country: clean(payload.country || payload["Country or Region"]),
    productInterest: clean(payload.productInterest || payload["Product interest"]),
    projectDetails: clean(payload.projectDetails || payload["Project details"]),
    website: clean(payload.website),
  };
}

function clean(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function validateInquiry(inquiry) {
  if (!inquiry.fullName) return "Please enter your full name.";
  if (!inquiry.company) return "Please enter your company.";
  if (!EMAIL_PATTERN.test(inquiry.workEmail)) return "Please enter a valid work email.";
  if (!inquiry.productInterest) return "Please select a product interest.";
  if (!inquiry.projectDetails || inquiry.projectDetails.length < 12) {
    return "Please add a few more project details.";
  }
  if (inquiry.projectDetails.length > 5000) {
    return "Project details are too long. Please shorten your message.";
  }
  return "";
}

async function sendWithResend({ apiKey, from, to, inquiry, request }) {
  const subject = `New GYUTRON sales inquiry - ${inquiry.company}`;
  const context = requestContext(request);
  const text = buildTextEmail(inquiry, context);
  const html = buildHtmlEmail(inquiry, context);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: inquiry.workEmail,
      subject,
      text,
      html,
    }),
  });

  if (!response.ok) {
    return { ok: false };
  }

  const body = await response.json().catch(() => ({}));
  return { ok: true, id: body.id };
}

function requestContext(request) {
  return {
    ip: request.headers.get("cf-connecting-ip") || "",
    country: request.headers.get("cf-ipcountry") || "",
    userAgent: request.headers.get("user-agent") || "",
    submittedAt: new Date().toISOString(),
  };
}

function buildTextEmail(inquiry, context) {
  return [
    "New GYUTRON sales inquiry",
    "",
    `Name: ${inquiry.fullName}`,
    `Company: ${inquiry.company}`,
    `Work email: ${inquiry.workEmail}`,
    `Phone / WhatsApp: ${inquiry.phone || "-"}`,
    `Country / Region: ${inquiry.country || "-"}`,
    `Product interest: ${inquiry.productInterest}`,
    "",
    "Project details:",
    inquiry.projectDetails,
    "",
    "Submission context:",
    `Submitted at: ${context.submittedAt}`,
    `IP country: ${context.country || "-"}`,
    `IP: ${context.ip || "-"}`,
    `User agent: ${context.userAgent || "-"}`,
  ].join("\n");
}

function buildHtmlEmail(inquiry, context) {
  const rows = [
    ["Name", inquiry.fullName],
    ["Company", inquiry.company],
    ["Work email", inquiry.workEmail],
    ["Phone / WhatsApp", inquiry.phone || "-"],
    ["Country / Region", inquiry.country || "-"],
    ["Product interest", inquiry.productInterest],
    ["Submitted at", context.submittedAt],
    ["IP country", context.country || "-"],
  ];

  return `
    <div style="font-family:Arial,sans-serif;color:#17151d;line-height:1.5;">
      <h2 style="margin:0 0 16px;color:#4b2e83;">New GYUTRON sales inquiry</h2>
      <table cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:680px;">
        ${rows
          .map(
            ([label, value]) => `
              <tr>
                <td style="border:1px solid #e6e0ee;font-weight:700;width:180px;">${escapeHtml(label)}</td>
                <td style="border:1px solid #e6e0ee;">${escapeHtml(value)}</td>
              </tr>
            `,
          )
          .join("")}
      </table>
      <h3 style="margin:24px 0 8px;color:#17151d;">Project details</h3>
      <div style="white-space:pre-wrap;border-left:4px solid #6f2dbd;padding:12px 16px;background:#fbfafc;">${escapeHtml(
        inquiry.projectDetails,
      )}</div>
      <p style="margin-top:20px;color:#6f687a;font-size:12px;">IP: ${escapeHtml(context.ip || "-")}<br>User agent: ${escapeHtml(
        context.userAgent || "-",
      )}</p>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...headers },
  });
}
