import { useEvent } from "~resources/ui/providers/event"
import React, { useState } from "react"
import { ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal"
import { Input } from "@heroui/input"
import { Button } from "@heroui/button"
import type { PlayerDbo } from "~resources/domain/dbos/player.dbo"

type PlayerEditProps = {
  playerId: string
}

const PlayerModalEdit = ({ playerId }: PlayerEditProps) => {
  const { event, updatePlayerOverride } = useEvent() // Assuming event provider exposes an update method
  const player: PlayerDbo = event.players[playerId] // Fallback to prevent crashes

  if (!player) {
    return
  }

  // State to track form inputs
  const [formData, setFormData] = useState({
    firstName: player.overrides?.firstName || "",
    lastName: player.overrides?.lastName || "",
    displayName: player.overrides?.displayName || "",
    archetype: player.overrides?.archetype || "",
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
    })
  }

  return (
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
  )
}

export default PlayerModalEdit;
