import { type ButtonProps, type Selection, useDisclosure } from "@heroui/react"
import { Button } from "@heroui/button"
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal"
import React, { useCallback } from "react"

type BulkDeletionButtonProps = {
  selection: Selection,
  children?: React.ReactNode,
  modalTitle?: string,
  modalContent?: (selection: Selection) => React.ReactNode,
  threshold: number,
  onDeletion: () => void,
  callback?: () => any,
} & ButtonProps

const BulkDeletionButton: React.FC<BulkDeletionButtonProps> = ({ children, selection, onDeletion, threshold = 5, modalContent, modalTitle = 'Are you sure ?', color = "danger", ...props}) => {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  const deleteOrWarn = useCallback(() => {
    if (selection === 'all' || selection.size >= threshold) {
      onOpen()
    } else {
      onDeletion()
    }
  }, [selection, onDeletion])

  const isDisabled = !isOpen && selection !== 'all' && selection.size === 0

  let content: React.ReactNode ;
  if (modalContent) {
    content = modalContent(selection)
  } else {
    content = `You are about to delete ${selection === "all" ? "all items" : `${selection.size} item(s)`}. This action is irreversible. Are you absolutely sure?`
  }

  return (<>
    <Button {...props} color={color} isDisabled={isDisabled} onPress={deleteOrWarn}>
      {children ?? 'Delete'}
    </Button>

    <Modal
      isDismissable={true}
      isKeyboardDismissDisabled={true}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">{modalTitle}</ModalHeader>
            <ModalBody>
              <p>
                {content}
              </p>
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" variant="light" onPress={onClose}>
                Dismiss
              </Button>
              <Button {...props} color={color} onPress={onDeletion}>
                {children ?? 'Delete'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  </>)
}

export default BulkDeletionButton