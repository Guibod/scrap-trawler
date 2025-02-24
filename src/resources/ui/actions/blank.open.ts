import { sendToBackground } from "@plasmohq/messaging"

export const openBlank = () => {
  sendToBackground({
    name: "back/open-blank"
  })
}