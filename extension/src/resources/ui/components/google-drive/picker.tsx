import React, { useEffect, useRef } from "react"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal"
import { useDisclosure } from "@heroui/react"
import { Button } from "@heroui/button"

interface GooglePickerProps {
  pickerUrl?: string
  onPick: (url: string | null) => void
}

const GooglePicker: React.FC<GooglePickerProps> = ({
                                                     pickerUrl = "https://scraptrawler.app/google.drive.picker",
                                                     onPick,
                                                   }: GooglePickerProps) => {
  const {isOpen, onOpen, onOpenChange} = useDisclosure({defaultOpen: true});
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.m === "pickerResult") {
        console.log("Picker result received", event.data)
        if (event.data.url) {
          onPick(event.data.url)
        } else {
          console.log("Picker result ignored (null or empty URL)")
        }
      }
    }
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [onPick, isOpen])

  useEffect(() => {
    const frame = iframeRef.current
    if (!frame) return

    const handleIframeLoad = () => {
      console.log("Picker iframe loaded, sending showPicker")
      frame.contentWindow?.postMessage({ m: "showPicker" }, "*")
    }

    frame.addEventListener("load", handleIframeLoad)
    return () => frame.removeEventListener("load", handleIframeLoad)
  }, [])

  return (
    <Modal
      isDismissable={true}
      isKeyboardDismissDisabled={true}
      isOpen={isOpen}
      size="full"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Pick a google file</ModalHeader>
            <ModalBody>
              <iframe
                ref={iframeRef}
                title="Google Drive Picker"
                src={pickerUrl}
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                className="w-full h-full border-none"
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" color="secondary" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default GooglePicker