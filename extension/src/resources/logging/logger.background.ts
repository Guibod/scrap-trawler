import type { LoggerInterface } from "./interface";
import { createConsola, type ConsolaInstance } from "consola"

export class BackgroundLogger implements LoggerInterface {
  private readonly logger: ConsolaInstance;
  name: string;

  constructor(context: string) {
    this.name = context;
    this.logger = createConsola({
      level: 4,
      fancy: true,
      formatOptions: {
        showTime: true,
        secondaryColor: "cyan",
        primaryColor: "green"
      }
    });
  }

  start(message: string) {
    this.logger.start(message);
  }

  debug(message: string, data?: object): void {
    this.logger.debug(`${this.name}:`, message, data);
  }

  info(message: string, data?: object): void {
    this.logger.info(`${this.name}:`, message, data);
  }

  warn(message: string, data?: object): void {
    this.logger.warn(`${this.name}:`, message, data);
  }

  error(message: string, data?: object): void {
    this.logger.error(`${this.name}:`, message, data);
  }

  exception(error: Error): void {
    this.logger.error(error);
  }
}
