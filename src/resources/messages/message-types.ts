export enum MessageTypes {
  GET_EVENT = "GET_EVENT",
  APP_EXTRACT_EVENT_REQUEST = "APP_EXTRACT_EVENT_REQUEST",
  WORLD_EXTRACT_EVENT_REQUEST = "WORLD_EXTRACT_EVENT_REQUEST",
  AUTH_TOKEN_REQUEST = "REQUEST_AUTH_TOKEN",
  TOGGLE_SIDEPANEL = "TOGGLE_SIDEPANEL",
  APP_VERSION_REQUEST = "REQUEST_APP_VERSION",
  LOG = "LOG",
  OPEN_BLANK = "OPEN_BLANK",
}

export function isWorldExtractEventMessage(
  message: BaseMessage
): message is WorldExtractEventMessage {
  return (
    message.action === MessageTypes.WORLD_EXTRACT_EVENT_REQUEST
  )
}
export function isAppExtractEventMessage(message: BaseMessage): message is AppExtractEventMessage {
  return message.action === MessageTypes.APP_EXTRACT_EVENT_REQUEST;
}
export function isAuthTokenRequest(message: BaseMessage): message is WorldExtractEventMessage {
  return message.action === MessageTypes.AUTH_TOKEN_REQUEST;
}
export function isAppVersionRequest(message: BaseMessage): message is WorldExtractEventMessage {
  return message.action === MessageTypes.APP_VERSION_REQUEST;
}
export function isLogMessage(message: BaseMessage): message is LogMessage {
  return (message as BaseMessage).action === MessageTypes.LOG;
}
export function isToggleSidePanelMessage(message: any): message is ToggleSidePanelMessage {
  return (message as BaseMessage).action === MessageTypes.TOGGLE_SIDEPANEL;
}
export function isOpenBlankMessage(message: any): message is OpenBlankPageMessage {
  return (message as BaseMessage).action === MessageTypes.OPEN_BLANK;
}
export function isGetEventMessage(message: any): message is GetEventMessage {
  return (message as BaseMessage).action === MessageTypes.GET_EVENT;
}

export interface BaseMessage {
  action: MessageTypes,
}

export interface WorldExtractEventMessage extends BaseMessage {
  action: MessageTypes.WORLD_EXTRACT_EVENT_REQUEST,
  eventId: string,
  organizationId: string,
  accessToken: string
}

export interface AppExtractEventMessage extends BaseMessage {
  action: MessageTypes.APP_EXTRACT_EVENT_REQUEST,
  eventId: string,
  organizationId: string,
}

export interface RequestAuthTokenMessage extends BaseMessage {
  action: MessageTypes.AUTH_TOKEN_REQUEST,
}

export interface RequestAppVersionMessage extends BaseMessage {
  action: MessageTypes.APP_VERSION_REQUEST,
}

export interface LogMessage extends BaseMessage {
  action: MessageTypes.LOG,
  level: "debug" | "info" | "warn" | "error",
  message: string,
  context: string,
  data?: object
}

export interface ToggleSidePanelMessage extends BaseMessage {
  action: MessageTypes.TOGGLE_SIDEPANEL,
  open?: boolean,
}
export interface OpenBlankPageMessage extends BaseMessage {
  action: MessageTypes.OPEN_BLANK,
}
export interface GetEventMessage extends BaseMessage {
  action: MessageTypes.GET_EVENT,
  eventId: string
}