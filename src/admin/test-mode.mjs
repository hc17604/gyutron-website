/** Demo transport is selected once per document; changing mode reloads the document. */
export function readWorkspaceTestMode(href, readStored = () => globalThis.sessionStorage.getItem('gyutron.workspace.test-mode.v1')) {
  const params = new URL(href, 'https://workspace.invalid').searchParams;
  if (params.has('test')) return params.get('test') === '1';
  try { return readStored() === '1'; } catch { return false; }
}

export function createWorkspaceTransport({demo, loadDemo, liveRequest, onWrite = () => {}, blocked = () => false}) {
  const abort = () => Object.assign(new Error('Workspace context changed.'), {name: 'AbortError'});
  return async function request(path, options = {}) {
    if (blocked() || options.signal?.aborted) throw abort();
    const writing = !['GET', 'HEAD'].includes(String(options.method || 'GET').toUpperCase());
    if (writing) onWrite(1);
    try {
      // A missing/failed demo route must never fall through to the live API.
      if (demo) {
        const workspace = await loadDemo();
        if (blocked() || options.signal?.aborted) throw abort();
        const result = await workspace.api(path, options);
        if (blocked() || options.signal?.aborted) throw abort();
        return result;
      }
      return await liveRequest(path, options);
    } finally { if (writing) onWrite(-1); }
  };
}

export async function switchWorkspaceTestMode({enabled, href, activeWrites, isBusy, canLeave, discard, persist, reload}) {
  if (activeWrites() || isBusy()) return {changed: false, reason: 'busy'};
  if (!await canLeave()) return {changed: false, reason: 'declined'};
  if (activeWrites() || isBusy()) return {changed: false, reason: 'busy'};
  const target = new URL(href, 'https://workspace.invalid');
  target.searchParams.set('test', enabled ? '1' : '0');
  // Record IDs and saved views belong to the current data source.
  target.hash = (target.hash.split('?')[0] || '#overview');
  discard();
  try { persist(enabled); } catch { /* The explicit URL remains authoritative. */ }
  reload(target.pathname + target.search + target.hash);
  return {changed: true};
}
