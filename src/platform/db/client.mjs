/**
 * D1 access. The whole backend degrades gracefully when no DB is bound:
 * `getDb` returns null and callers fall back (writes 503, reads empty) so the
 * static site + contact email keep working before D1 is provisioned.
 */
export function getDb(env) {
  return env && env.DB ? env.DB : null;
}

export function hasDb(env) {
  return Boolean(env && env.DB);
}
