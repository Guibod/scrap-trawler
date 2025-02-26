import { sendToBackground } from "@plasmohq/messaging"

export const eventOpen = async (eventId: string): Promise<void> => {
  await sendToBackground({name: "back/event-open", body : { eventId }} )
};
