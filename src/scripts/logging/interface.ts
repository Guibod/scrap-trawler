export interface LoggerInterface {
  name: string;

  start(message: string, data?: object): void;
  debug(message: string, data?: object): void;
  info(message: string, data?: object): void;
  warn(message: string, data?: object): void;
  error(message: string, data?: object): void;
  exception(error: Error): void;
}
