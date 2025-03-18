import { type LoggerInterface } from "./interface";
import { type ConsolaInstance, createConsola, type ConsolaReporter, type LogObject } from "consola";
import { sendToBackground } from "@plasmohq/messaging";


export class ContentScriptLogger implements LoggerInterface {
  name: string;
  private logger: ConsolaInstance;
  private static logQueue: Array<{ level: string; message: string; context: string; data?: any }> = [];
  private static isProcessing = false;

  constructor(name: string) {
    this.name = name;
    this.logger = createConsola({
      fancy: true,
      level: 4,
      formatOptions: {
        date: true
      }
    });

    // Start log processing once per extension session
    if (!ContentScriptLogger.isProcessing) {
      ContentScriptLogger.isProcessing = true;
      ContentScriptLogger.processLogQueue();
    }
  }

  private static async processLogQueue() {
    while (true) {
      if (ContentScriptLogger.logQueue.length > 0) {
        const batch = ContentScriptLogger.logQueue.splice(0, 20);

        try {
          await sendToBackground({
            name: "logging/page-to-backend",
            body: batch,
          });
        } catch (error) {
          console.warn("Failed to send logs to background:", error);
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 500)); // Allow IndexedDB & other tasks to run
    }
  }

  private enqueueLog(level: "start" | "debug" | "info" | "warn" | "error", message: string, data?: object): void {
    const consolaMethod = {
      start: this.logger.start,
      debug: this.logger.debug,
      info: this.logger.info,
      warn: this.logger.warn,
      error: this.logger.error,
    }[level];

    consolaMethod.call(this.logger, message, data); // ✅ Calls the correct method directly

    ContentScriptLogger.logQueue.push({
      level,
      message,
      context: this.name,
      data,
    });

    // Prevent queue overflow
    if (ContentScriptLogger.logQueue.length > 1000) {
      ContentScriptLogger.logQueue.shift(); // Drop oldest log
    }
  }

  start(message: string, data?: object): void {
    this.enqueueLog("start", message, data);
  }

  debug(message: string, data?: object): void {
    this.enqueueLog("debug", message, data);
  }

  info(message: string, data?: object): void {
    this.enqueueLog("info", message, data);
  }

  warn(message: string, data?: object): void {
    this.enqueueLog("warn", message, data);
  }

  error(message: string, data?: object): void {
    this.enqueueLog("error", message, data);
  }

  exception(error: Error): void {
    this.enqueueLog("error", error.message, { stack: error.stack });
  }
}
