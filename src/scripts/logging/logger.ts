import { BackgroundLogger } from "./logger.background";
import { ContentScriptLogger } from "./logger.content";
import type { LoggerInterface } from "./interface";

export class LoggerProxy implements LoggerInterface {
  private logger: LoggerInterface;
  readonly loggerImplementation: string; // New property for testing
  readonly name: string;

  constructor(name: string) {
    if (LoggerProxy.isBackgroundServiceWorker()) {
      this.logger = new BackgroundLogger(name);
    } else {
      this.logger = new ContentScriptLogger(name);
    }
    console.log("initiated logger", name, this.logger.constructor.name);
    this.loggerImplementation = this.logger.constructor.name;
    this.name = this.logger.name;
  }

  static isBackgroundServiceWorker(): boolean {
    return typeof chrome !== "undefined" &&
      chrome.runtime &&
      !!chrome.runtime.id &&
      typeof chrome.tabs !== "undefined";
  }

  start(message: string, data?: object): void {
    this.logger.start(message, data);
  }

  debug(message: string, data?: object): void {
    this.logger.debug(message, data);
  }

  info(message: string, data?: object): void {
    this.logger.info(message, data);
  }

  warn(message: string, data?: object): void {
    this.logger.warn(message, data);
  }

  error(message: string, data?: object): void {
    this.logger.error(message, data);
  }

  exception(error: Error): void {
    this.logger.exception(error);
  }
}

const loggerCache = new Map<string, LoggerProxy>(); // Optional caching mechanism

export function getLogger(context: string): LoggerProxy {
  if (!loggerCache.has(context)) {
    loggerCache.set(context, new LoggerProxy(context));
  }
  return loggerCache.get(context)!;
}