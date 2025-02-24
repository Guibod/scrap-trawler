import { sendToBackground } from "@plasmohq/messaging"

export const eventDelete = async (eventId: string): Promise<void> => {
  await sendToBackground({name: "back/event-delete", body : { eventId }} )
};
