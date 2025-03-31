import { useEvent } from "~/resources/ui/providers/event"
import React, { useState } from "react"
import { useDisclosure } from "@heroui/react"
import { Button } from "@heroui/button"
import { PencilIcon } from "@heroicons/react/20/solid"
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal"
import { Input, Textarea } from "@heroui/input"
import type { PlayerDbo } from "~/resources/domain/dbos/player.dbo"
import { cn } from "@heroui/theme"

type PlayerEditProps = {
  playerId: string,
  className?: string
}

const PlayerEdit: React.FC<PlayerEditProps> = ({playerId, className}) => {
  const { event, updatePlayerOverride } = useEvent()
  const player: PlayerDbo = event.players[playerId]
  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  const [formData, setFormData] = useState({
    firstName: player.overrides?.firstName || "",
    lastName: player.overrides?.lastName || "",
    displayName: player.overrides?.displayName || "",
    archetype: player.overrides?.archetype || "",
    decklistUrl: player.overrides?.decklistUrl || "",
    decklistTxt: player.overrides?.decklistTxt || "",
  })

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle submit action
  const handleSubmit = () => {
    updatePlayerOverride(playerId, {
      firstName: formData.firstName || null,
      lastName: formData.lastName || null,
      displayName: formData.displayName || null,
      archetype: formData.archetype || null,
      decklistUrl: formData.decklistUrl || null,
      decklistTxt: formData.decklistTxt || null,
    })
  }

  return (
    <>
      <Button
        color="primary"
        size="sm"
        variant="light"
        onPress={onOpen}
        isIconOnly={false}
        aria-label="Edit player"
        className={cn(className)}
      >
        <PencilIcon className="w-4 h-4" /> Edit
      </Button>

      <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Edit player</ModalHeader>
              <ModalBody>
                <Input
                  label="First Name"
                  name="firstName"
                  placeholder={player.firstName}
                  variant="bordered"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  placeholder={player.lastName}
                  variant="bordered"
                  value={formData.lastName}
                  onChange={handleChange}
                />
                <Input
                  label="Display Name"
                  name="displayName"
                  description="This is the WOTC user name"
                  placeholder={player.displayName}
                  variant="bordered"
                  value={formData.displayName}
                  onChange={handleChange}
                />
                <Input
                  label="Archetype"
                  name="archetype"
                  placeholder={player.archetype}
                  variant="bordered"
                  value={formData.archetype}
                  onChange={handleChange}
                />
                <Input
                  label="Decklist URL"
                  name="decklistUrl"
                  placeholder="https://example.com/decklist"
                  variant="bordered"
                  value={formData.decklistUrl}
                  onChange={handleChange}
                />
                <Textarea
                  label="Decklist Text"
                  name="decklistTxt"
                  placeholder={"1 lightning bolt\n1 mountain\n"}
                  variant="bordered"
                  value={formData.decklistTxt}
                  onChange={handleChange} />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={() => { handleSubmit(); onClose(); }}>
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}

export default PlayerEdit