import { env } from "@/config/env";

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const colors: Record<LogLevel | 'reset', string> = {
  debug: '\x1b[34m', // Blue
  info: '\x1b[32m',  // Green
  warn: '\x1b[33m',  // Yellow
  error: '\x1b[31m', // Red
  reset: '\x1b[0m'   // Reset
};

const levels: LogLevel[] = [ 'debug', 'info', 'warn', 'error' ];

function getCurrentLevelIndex(): number {
  const configured = (env.LOG_LEVEL || 'info') as LogLevel;
  const idx = levels.indexOf(configured);
  return idx === -1 ? levels.indexOf('info') : idx;
}

function shouldLog(level: LogLevel): boolean {
  return levels.indexOf(level) >= getCurrentLevelIndex();
}

function safeStringify(meta: unknown): string {
  try {
    return JSON.stringify(meta, null, 2);
  } catch {
    return String(meta);
  }
}

function format(level: LogLevel, msg: string, meta?: unknown): string {
  const time = new Date().toISOString();
  const color = colors[level];
  const reset = colors.reset;
  let out = `${color}[${time}] [${level.toUpperCase()}]${reset} ${msg}`;
  if (meta !== undefined) {
    out += `\n${safeStringify(meta)}`;
  }
  return out;
}

export const log_debug = (msg: string, meta?: unknown): void => {
  if (shouldLog('debug')) console.log(format('debug', msg, meta));
};

export const log_info = (msg: string, meta?: unknown): void => {
  if (shouldLog('info')) console.log(format('info', msg, meta));
};

export const log_warn = (msg: string, meta?: unknown): void => {
  if (shouldLog('warn')) console.warn(format('warn', msg, meta));
};

export const log_error = (msg: string, meta?: unknown): void => {
  if (shouldLog('error')) console.error(format('error', msg, meta));
};