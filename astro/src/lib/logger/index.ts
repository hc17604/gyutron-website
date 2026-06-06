/**
 * Tiny structured logger. Wraps console with a consistent prefix and levels so a real
 * logging/observability backend can swap in later without touching call sites.
 */
type Level = 'info' | 'warning' | 'error';

const PREFIX = '[gyutron]';

function emit(level: Level, message: string, meta?: unknown): void {
  const line = `${PREFIX} ${level}: ${message}`;
  if (level === 'error') console.error(line, meta ?? '');
  else if (level === 'warning') console.warn(line, meta ?? '');
  else console.info(line, meta ?? '');
}

export const logInfo = (message: string, meta?: unknown): void => emit('info', message, meta);
export const logWarning = (message: string, meta?: unknown): void => emit('warning', message, meta);
export const logError = (message: string, meta?: unknown): void => emit('error', message, meta);
