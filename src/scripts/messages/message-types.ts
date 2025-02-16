import { MessageTypes } from "~scripts/messages/messages"

export function isWorldExtractEventMessage(message: any): message is WorldExtractEventMessage {
  return (message as BaseMessage).action === MessageTypes.WORLD_EXTRACT_EVENT_REQUEST;
}
export function isAppExtractEventMessage(message: any): message is AppExtractEventMessage {
  return (message as BaseMessage).action === MessageTypes.APP_EXTRACT_EVENT_REQUEST;
}
export function isAuthTokenRequest(message: any): message is WorldExtractEventMessage {
  return (message as BaseMessage).action === MessageTypes.AUTH_TOKEN_REQUEST;
}
export function isAppVersionRequest(message: any): message is WorldExtractEventMessage {
  return (message as BaseMessage).action === MessageTypes.AUTH_TOKEN_REQUEST;
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