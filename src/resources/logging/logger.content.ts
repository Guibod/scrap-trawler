import { type LoggerInterface } from "./interface";
import { MessageTypes } from "~resources/messages/message-types"
import { type ConsolaInstance, createConsola } from "consola"

export class ContentScriptLogger implements LoggerInterface {
  name: string;
  private logger: ConsolaInstance

  constructor(name: string) {
    this.name = name;
    this.logger = createConsola({
      fancy: true,
      level: 4
    })
  }

  private sendToBackground(level: string, message: string, data?: object): void {
    if (typeof chrome === "undefined" || !chrome.runtime?.sendMessage) {
      return; // Prevents `ReferenceError`
    }

    chrome.runtime.sendMessage({
      action: MessageTypes.LOG,
      level,
      context: this.name,
      message,
      data,
    });
  }

  start(message: string, data?: object): void {
    this.logger.start(message, data)
    this.sendToBackground("start", message, data);
  }

  debug(message: string, data?: object): void {
    this.logger.debug(message, data)
    this.sendToBackground("debug", message, data);
  }

  info(message: string, data?: object): void {
    this.logger.info(message, data)
    this.sendToBackground("info", message, data);
  }

  warn(message: string, data?: object): void {
    this.logger.warn(message, data)
    this.sendToBackground("warn", message, data);
  }

  error(message: string, data?: object): void {
    this.logger.error(message, data)
    this.sendToBackground("error", message, data);
  }

  exception(error: Error): void {
    this.logger.error(error)
    this.sendToBackground("error", error.message, { stack: error.stack });
  }
}
