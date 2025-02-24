import { type LoggerInterface } from "./interface";
import { type ConsolaInstance, createConsola } from "consola"
import { sendToBackground } from "@plasmohq/messaging"

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

  start(message: string, data?: object): void {
    this.logger.start(message, data)
    sendToBackground({
      name: "back/log",
      body: {
        level: "start",
        message: message,
        context: this.name,
        data: data
      }
    });
  }

  debug(message: string, data?: object): void {
    this.logger.debug(message, data)
    sendToBackground({
      name: "back/log",
      body: {
        level: "start",
        message: message,
        context: this.name,
        data: data
      }
    });
  }

  info(message: string, data?: object): void {
    this.logger.info(message, data)
    sendToBackground({
      name: "back/log",
      body: {
        level: "info",
        message: message,
        context: this.name,
        data: data
      }
    });
  }

  warn(message: string, data?: object): void {
    this.logger.warn(message, data)
    sendToBackground({
      name: "back/log",
      body: {
        level: "warn",
        message: message,
        context: this.name,
        data: data
      }
    });
  }

  error(message: string, data?: object): void {
    this.logger.error(message, data)
    sendToBackground({
      name: "back/log",
      body: {
        level: "error",
        message: message,
        context: this.name,
        data: data
      }
    });
  }

  exception(error: Error): void {
    this.logger.error(error)
    sendToBackground({
      name: "back/log",
      body: {
        level: "error",
        message: error.message,
        context: this.name,
        data: error.stack
      }
    });
  }
}
