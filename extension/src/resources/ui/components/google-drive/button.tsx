import React, { useEffect, useRef, useState } from "react"
import { Button } from "@heroui/button"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal"
import { useDisclosure } from "@heroui/react"
import { cn } from "@heroui/theme"
import type { UseButtonProps } from "@heroui/button/dist/use-button"
import { OauthService } from "~/resources/integrations/google-oauth/oauth.service"
import type { SpreadsheetMetadata } from "~/resources/domain/dbos/spreadsheet.dbo"
import { useEventSetup } from "~/resources/ui/components/event/setup/provider"
import { GoogleDriveService } from "~/resources/integrations/google-doc/googleDriveService"

interface DrivePickerButtonProps extends UseButtonProps {
  metadata: SpreadsheetMetadata
  className?: string
}

export const DriveSpreadsheetPickerButton: React.FC<DrivePickerButtonProps> = ({ metadata, className, ...props }) => {
  const [loading, setLoading] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { handleImport, spreadsheetMeta } = useEventSetup()
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()

  const handleClick = async () => {
    setLoading(true)
    try {
      await OauthService.getInstance().getGoogleApiToken({ interactive: true })
      onOpen()
    } catch (e) {
      console.error("Drive picker auth failed", e)
      setLoading(false)
    }
  }

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.m === "pickerResult") {
        console.log("Picker result received", event.data)
        if (event.data.url) {
          const source = GoogleDriveService.extractGoogleDriveFileId(event.data.url)
          if (!source) {
            console.error("Failed to parse file ID from", event.data.url)
            return
          }
          handleImport({ metadata: { sourceType: "drive", source, autodetect: metadata.autodetect } })
          onClose()
        } else {
          console.log("Picker result ignored (null or empty URL)")
        }
        setLoading(false)
      }
    }
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [metadata.autodetect, handleImport])

  useEffect(() => {
    const frame = iframeRef.current
    if (!frame || !isOpen) return
    const onLoad = () => {
      console.log("Picker iframe loaded, sending showPicker")
      frame.contentWindow?.postMessage({ m: "showPicker" }, "*")
    }
    frame.addEventListener("load", onLoad)
    return () => frame.removeEventListener("load", onLoad)
  }, [isOpen])

  const label = spreadsheetMeta.source
    ? "Pick another Google Drive file…"
    : "Pick a Google Drive file…"

  return (
    <>
      <Button
        onPress={handleClick}
        isLoading={loading}
        isDisabled={loading}
        className={cn("w-full", className)}
        color="primary"
        {...props}
      >
        {label}
      </Button>
      <Modal
        isDismissable
        isKeyboardDismissDisabled
        isOpen={isOpen}
        size="4xl"
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Pick a Google Sheet</ModalHeader>
              <ModalBody>
                <iframe
                  ref={iframeRef}
                  title="Google Drive Picker"
                  height="500px"
                  src="https://scraptrawler.app/google.drive.picker"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" color="secondary" onPress={onClose}>
                  Cancel
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}

export default DriveSpreadsheetPickerButton