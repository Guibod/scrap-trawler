import { EventExtractor } from "~resources/eventlink/event-extractor"
import { sendToBackground } from "@plasmohq/messaging"
import type { EventWriteDbo } from "~resources/domain/dbos/event.write.dbo"
import type { EventModel } from "~resources/domain/models/event.model"

export const eventScrape   = async (eventId: string, organizationId: string): Promise<EventModel> => {
  const accessToken = await sendToBackground({
    name: "back/get_auth_token"
  })
  const clientHeader = await sendToBackground({
    name: "back/get-client-header"
  })

  const extractor = new EventExtractor(accessToken, clientHeader, eventId, organizationId);
  const extracted = await extractor.extract();
  const body: EventWriteDbo = {
    id: eventId,
    name: extracted.event.title,
    date: new Date(extracted.event.actualStartTime || extracted.event.scheduledStartTime),
    organizer: extracted.organization.name,
    raw_data: {
      wotc: extracted
    },
  }

  return sendToBackground({
    name: "back/event-put",
    body
  })
};
