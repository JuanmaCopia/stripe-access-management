import type { LogLevel } from "../config/index.js";
import type { AppLogger, LogContext } from "./app-logger.js";

interface ConsoleLike {
  debug(message?: unknown, ...optionalParams: unknown[]): void;
  error(message?: unknown, ...optionalParams: unknown[]): void;
  info(message?: unknown, ...optionalParams: unknown[]): void;
  warn(message?: unknown, ...optionalParams: unknown[]): void;
}

const logLevelWeight: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

export interface ConsoleAppLoggerOptions {
  console?: ConsoleLike;
  defaultContext?: LogContext;
  level?: LogLevel;
}

export class ConsoleAppLogger implements AppLogger {
  private readonly console: ConsoleLike;

  private readonly defaultContext: LogContext;

  private readonly level: LogLevel;

  constructor(options: ConsoleAppLoggerOptions = {}) {
    this.console = options.console ?? console;
    this.defaultContext = options.defaultContext ?? {};
    this.level = options.level ?? "info";
  }

  child(defaultContext: LogContext): AppLogger {
    return new ConsoleAppLogger({
      console: this.console,
      defaultContext: {
        ...this.defaultContext,
        ...defaultContext
      },
      level: this.level
    });
  }

  debug(message: string, context?: LogContext): void {
    this.log("debug", message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log("info", message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log("warn", message, context);
  }

  error(message: string, context?: LogContext): void {
    this.log("error", message, context);
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const mergedContext = {
      ...this.defaultContext,
      ...context
    };
    const serializedContext =
      Object.keys(mergedContext).length === 0
        ? ""
        : ` ${JSON.stringify(mergedContext)}`;

    switch (level) {
      case "debug":
        this.console.debug(`[debug] ${message}${serializedContext}`);
        return;
      case "info":
        this.console.info(`[info] ${message}${serializedContext}`);
        return;
      case "warn":
        this.console.warn(`[warn] ${message}${serializedContext}`);
        return;
      case "error":
        this.console.error(`[error] ${message}${serializedContext}`);
        return;
      default:
        return;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return logLevelWeight[level] >= logLevelWeight[this.level];
  }
}
