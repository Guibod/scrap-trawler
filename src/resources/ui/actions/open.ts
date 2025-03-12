import { sendToBackground } from "@plasmohq/messaging"

export const openApp = async (path: string = ""): Promise<void> => {
  await sendToBackground({name: "back/open", body : { path }} )
};
