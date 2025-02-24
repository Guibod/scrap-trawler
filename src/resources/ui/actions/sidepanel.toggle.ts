import { sendToBackground } from "@plasmohq/messaging"

export const toggleSidePanel = async () => {
  return sendToBackground({
    name: "back/sidepanel-toggle",
  })
}