export type LogContextValue = boolean | number | string | null | undefined;

export interface LogContext {
  [key: string]: LogContextValue;
}

export interface AppLogger {
  child(defaultContext: LogContext): AppLogger;
  debug(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
}
