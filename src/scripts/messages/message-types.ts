export enum MessageTypes {
  APP_EXTRACT_EVENT_REQUEST = "APP_EXTRACT_EVENT_REQUEST",
  WORLD_EXTRACT_EVENT_REQUEST = "WORLD_EXTRACT_EVENT_REQUEST",
  AUTH_TOKEN_REQUEST = "REQUEST_AUTH_TOKEN",
  APP_VERSION_REQUEST = "REQUEST_APP_VERSION"
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

export interface BaseMessage {
  action: MessageTypes,
}

export interface WorldExtractEventMessage extends BaseMessage {
  action: MessageTypes.WORLD_EXTRACT_EVENT_REQUEST,
  eventId: number,
  organizationId: number,
  accessToken: string
}

export interface AppExtractEventMessage extends BaseMessage {
  action: MessageTypes.APP_EXTRACT_EVENT_REQUEST,
  url: string,
}

export interface RequestAuthTokenMessage extends BaseMessage {
  action: MessageTypes.AUTH_TOKEN_REQUEST,
}

export interface RequestAppVersionMessage extends BaseMessage {
  action: MessageTypes.APP_VERSION_REQUEST,
}