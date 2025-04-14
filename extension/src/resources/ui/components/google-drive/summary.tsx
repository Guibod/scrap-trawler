import React, { useEffect, useState } from "react"
import { ExternalLink } from "lucide-react"
import { type DriveFile, GoogleDriveService } from "~/resources/integrations/google-doc/googleDriveService"
import { Link } from "@heroui/link"
import { Button } from "@heroui/button"
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal"
import { cn } from "@heroui/theme"
import { useDisclosure } from "@heroui/react"

type DriveAccessSummaryProps = {
  className?: string
}

export const DriveAccessSummary: React.FC<DriveAccessSummaryProps> = ({className}) => {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [documents, setDocuments] = useState<DriveFile[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    GoogleDriveService.getInstance()
      .listAllSpreadsheets()
      .then(setDocuments)
      .catch((e) => {
        console.error("Failed to fetch drive files", e)
      })
      .finally(() => setLoading(false))
  }, [isOpen])

  return (
    <>
      <Button variant="ghost" className={cn(className)} onPress={onOpen}>
        {documents.length} shared Google Sheets
      </Button>
      <Modal
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={isOpen}
        onOpenChange={onOpenChange} title={"Accessible Google Sheets"}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h2 className="text-lg font-semibold">Google Sheets Access</h2>
                <p className="text-sm text-muted-foreground">
                  The following Google Sheets are shared with this app. You can view them directly in your
                  browser.
                </p>
              </ModalHeader>
              <ModalBody>
                {loading ? (
                  <p className="mt-4 text-sm text-muted">Loading…</p>
                ) : (
                  <ul className="mt-4 space-y-3 max-h-80 overflow-y-auto">
                    {documents.map((doc) => (
                      <li key={doc.id} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{doc.name}</div>
                          {doc.modifiedTime && (
                            <div className="text-xs text-muted-foreground">
                              Modified: {doc.modifiedTime.toLocaleString()}
                            </div>
                          )}
                        </div>
                        <a
                          href={`https://drive.google.com/file/d/${doc.id}/view`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                        >
                          View <ExternalLink size={14} />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="secondary" variant="light" onPress={onClose}>
                  Close
                </Button>

                <Button
                  color="primary"
                        showAnchorIcon
                        as={Link}
                        href="https://myaccount.google.com/permissions"
                        variant="solid"
                        target="_blank"
                >
                  Manage your app permissions on Google
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
