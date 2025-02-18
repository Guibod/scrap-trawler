import { MessageTypes, type ToggleSidePanelMessage } from "~resources/messages/message-types"

export const toggleSidePanel = () => {
  // logger.debug("Requested to toggle sidepanel");
  void chrome.runtime.sendMessage(
    { action: MessageTypes.TOGGLE_SIDEPANEL } as ToggleSidePanelMessage,
    (response) => {
      // logger.info("Toggling stuff done");
    }
  );
}