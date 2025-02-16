import type { BaseMessage } from './message-types';

export class ErrorResponse extends Error {
    constructor(public readonly action: string, public readonly sender: chrome.runtime.MessageSender, public readonly parentError: Error) {
      super(`Failed to resolve action "${action}"`);
    }
}