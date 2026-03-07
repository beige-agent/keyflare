import { getColorEnabled } from "./color.js";

/**
 * Simple logger that can be used as both a function and an object with methods
 *
 * Usage:
 * - logger('hello world') // logs as info
 * - logger.info('hello world')
 * - logger.error(new Error('something went wrong'))
 * - logger.warn('warning message')
 * - logger.debug('debug info')
 * - logger.setContext('userId', 'user123') // sets context data
 * - logger.getContext('userId') // gets context data
 * - logger.clearContext() // clears all context data
 */
export interface Logger {
  info: (message: string | unknown, ...rest: unknown[]) => void;
  error: (message: string | Error | unknown, ...rest: unknown[]) => void;
  warn: (message: string | unknown, ...rest: unknown[]) => void;
  debug: (message: string | unknown, ...rest: unknown[]) => void;
  setContext: (key: string, value: string | unknown) => void;
  getContext: (key: string) => string | unknown | undefined;
  clearContext: () => void;
}

const formatMessage = (message: string | Error | unknown): string => {
  if (message instanceof Error) {
    return `${message.name}: ${message.message}${
      message.stack ? "\n" + message.stack : ""
    }`;
  }
  if (typeof message === "object") {
    return JSON.stringify(message, null, 2);
  }
  return String(message);
};

const getColoredLevel = (level: string): string => {
  const colorEnabled = getColorEnabled();
  if (!colorEnabled) {
    return `[${level}]`;
  }

  switch (level) {
    case "ERROR":
      return `\x1b[31m[${level}]\x1b[0m`; // red
    case "WARN":
      return `\x1b[33m[${level}]\x1b[0m`; // yellow
    case "INFO":
      return `\x1b[32m[${level}]\x1b[0m`; // green
    case "DEBUG":
      return `\x1b[36m[${level}]\x1b[0m`; // cyan
    default:
      return `[${level}]`;
  }
};

export const createLogger = (isProduction: boolean = false): Logger => {
  // Use a mutable object to store context that can be updated during request lifecycle
  const context: Record<string, string | unknown> = {};

  const logJson = (
    level: string,
    message: string | Error | unknown,
    ...rest: unknown[]
  ): void => {
    const logEntry: Record<string, unknown> = {
      level,
      timestamp: new Date().toISOString(),
      message: formatMessage(message),
    };

    if (rest.length > 0) {
      logEntry.additional = rest.map(formatMessage);
    }

    if (Object.keys(context).length > 0) {
      logEntry.context = { ...context };
    }

    if (message instanceof Error && message.stack) {
      logEntry.stack = message.stack;
    }

    console.log(JSON.stringify(logEntry));
  };

  const logSimple = (
    consoleMethod: typeof console.log,
    level: string,
    message: string | unknown,
    ...rest: unknown[]
  ): void => {
    const coloredLevel = getColoredLevel(level);
    consoleMethod(
      coloredLevel,
      formatMessage(message),
      ...rest.map(formatMessage),
    );
  };

  return {
    info: (message: string | unknown, ...rest: unknown[]): void => {
      if (isProduction) {
        logJson("info", message, ...rest);
      } else {
        logSimple(console.log, "INFO", message, ...rest);
      }
    },
    error: (message: string | Error | unknown, ...rest: unknown[]): void => {
      if (isProduction) {
        logJson("error", message, ...rest);
      } else {
        logSimple(console.error, "ERROR", message, ...rest);
      }
    },
    warn: (message: string | unknown, ...rest: unknown[]): void => {
      if (isProduction) {
        logJson("warn", message, ...rest);
      } else {
        logSimple(console.warn, "WARN", message, ...rest);
      }
    },
    debug: (message: string | unknown, ...rest: unknown[]): void => {
      if (isProduction) {
        logJson("debug", message, ...rest);
      } else {
        logSimple(console.debug, "DEBUG", message, ...rest);
      }
    },
    setContext: (key: string, value: string | unknown): void => {
      context[key] = value;
    },
    getContext: (key: string): string | unknown | undefined => {
      return context[key];
    },
    clearContext: (): void => {
      Object.keys(context).forEach((key) => delete context[key]);
    },
  };
};

export const logger = createLogger();
