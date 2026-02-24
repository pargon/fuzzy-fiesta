import { ILogger } from "../../domain/ports/logger.port";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface Dependencies {}

export class ConsoleLogger implements ILogger {
  constructor(_deps: Dependencies) {}

  info(message: string, ...args: unknown[]): void {
    console.info(`[INFO] ${message}`, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(`[WARN] ${message}`, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    console.error(`[ERROR] ${message}`, ...args);
  }
}
