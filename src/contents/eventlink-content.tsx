import { ContentAccessor } from "~resources/eventlink/content.accessor";
import { EventExtractor } from "~resources/eventlink/event-extractor";
import { type BaseMessage, isAppVersionRequest, isWorldExtractEventMessage } from "~resources/messages/message-types"
import {
  type PlasmoCreateShadowRoot,
  type PlasmoCSConfig,
  type PlasmoGetInlineAnchorList,
  type PlasmoGetStyle,
  type PlasmoRender
} from "plasmo"
import { ScrapTrawlerError } from "~resources/exception"
import { getLogger } from "~resources/logging/logger"
import { HeroUIProvider } from "@heroui/react"
import EventCalendarAction from "~resources/ui/containers/event-calendar-action"
import EventTitleActions from "~resources/ui/containers/event-title-actions"
import { createRoot } from "react-dom/client"
import cssText from "data-text:~resources/ui/style.css"
import { OverlayRelativeToShadowHostCSUIContainer } from "~resources/ui/components/plasmo.custom"

const logger = getLogger("eventlink-content");
logger.start("Content script started");

export const config: PlasmoCSConfig = {
  matches: ["https://eventlink.wizards.com/*"],
  run_at: "document_idle"
};

const contentAccessor = new ContentAccessor();
(async () => {
  const wotcClientHeader = await contentAccessor.getXWotcClientHeader();

  chrome.runtime.onMessage.addListener((message: BaseMessage, sender, sendResponse) => {
    if (isAppVersionRequest(message)) {
      sendResponse(wotcClientHeader);
      return true;
    }

    if (isWorldExtractEventMessage(message)) {
      (async () => {
        try {
          const extractor = new EventExtractor(message.accessToken, wotcClientHeader, message.eventId, message.organizationId);
          sendResponse(await extractor.extract());
        } catch (e) {
          if (e instanceof ScrapTrawlerError) {
            sendResponse(e.toErrorResponse());
          }
        }
      })();

      return true;
    }

    return false;
  });

  logger.info("Content script initialized with X-WOTC-Client header:", { wotcClientHeader });
})();

export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => {
  const anchors = [];
  const eventAnchor = document.querySelector("div.event-page-header__primary, div.event-view__too-old");
  if (eventAnchor) {
    anchors.push({
      element: eventAnchor,
      insertPosition: "afterend"
    });
  }
  const calendarAnchors = Array.from(document.querySelectorAll(".event-card")).map((element) => ({
    element,
    insertPosition: "afterbegin"
  }))

  return anchors.concat(calendarAnchors)
}

export const render: PlasmoRender<any> = async ({ anchor, createRootContainer }, InlineCSUIContainer) => {
  const rootContainer = await createRootContainer(anchor);
  rootContainer.setAttribute("style", "")
  const root = createRoot(rootContainer)

  const Component = anchor.element.matches(".event-card")
    ? EventCalendarAction
    : EventTitleActions;
  let CSUIContainer = InlineCSUIContainer;

  if (anchor.element.matches(".event-card")) {
    // since we are using a relative shadow host, we use a simplified container
    CSUIContainer = OverlayRelativeToShadowHostCSUIContainer;
  }

  root.render(
    <CSUIContainer anchor={anchor}>
      <HeroUIProvider>
        <Component anchor={anchor}/>
      </HeroUIProvider>
    </CSUIContainer>
  )
};

export const createShadowRoot: PlasmoCreateShadowRoot = (shadowHost: HTMLElement) => {
  // ensure that the shadow host has a relative position and ignores the grid layout
  // this is necessary for .card anchor that are inside a grid layout
  shadowHost.setAttribute("style", "position: relative; grid-area: 1 / 1;")
  return shadowHost.attachShadow({ mode: "open" })
}

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = `${cssText}`

  return style
}

// TODO: optimize rendering by providing this kind of function
// see: https://docs.plasmo.com/framework/content-scripts-ui/life-cycle#detecting-and-optimizing-root-container-removal
// export const getShadowHostId: PlasmoGetShadowHostId = ({ element }) =>
//   element.getAttribute("data-custom-id") + `-pollax-iv`