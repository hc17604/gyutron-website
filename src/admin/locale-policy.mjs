/** Workspace UI policy only. Website languages and historical documents are separate. */
export const WORKSPACE_LANGUAGES = Object.freeze(['en', 'zh']);
export const WORKSPACE_LANGUAGE_STORAGE_KEY = 'gyutron.workspace.language.v2';

export function normalizeWorkspaceLanguage(value) {
  return value === 'zh' ? 'zh' : 'en';
}

export function selectWorkspaceLanguage({ query, stored, initial } = {}) {
  if (query !== null && query !== undefined) return normalizeWorkspaceLanguage(query);
  if (stored !== null && stored !== undefined) return normalizeWorkspaceLanguage(stored);
  return normalizeWorkspaceLanguage(initial);
}
