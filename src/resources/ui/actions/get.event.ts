import { type GetEventMessage, MessageTypes } from "~resources/messages/message-types";
import type { EventModel } from "~resources/domain/models/event.model"

export const getEvent = async (eventId: string): Promise<EventModel> => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action: MessageTypes.GET_EVENT,
        eventId
      } as GetEventMessage,
      (response: EventModel) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(response);
      }
    );
  });
};
