import { usePlayer } from "~/resources/ui/providers/event"
import React, { useState } from "react"
import { User } from "@heroui/user"
import { Button } from "@heroui/button"
import { PencilIcon } from "@heroicons/react/20/solid"
import PlayerName from "~/resources/ui/components/player/name"
import PlayerModalEdit from "~/resources/ui/components/player/edit.modal"
import { useDisclosure } from "@heroui/react"
import { Modal } from "@heroui/modal"
import ColorIdentity from "~/resources/ui/components/mana/identity"

export interface PlayerProps {
  playerId?: string
  editable?: boolean
  children?: React.ReactNode
}

const Player = ({ playerId, editable, children }: PlayerProps) => {
  const player = usePlayer(playerId)
  const [isHovered, setIsHovered] = useState(false) // Hover state
  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  return (
    <>
      {/* Player Wrapper with Hover Detection */}
      <div
        className="relative group flex items-center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* User Component */}
        <User
          avatarProps={{
            size: "lg",
            src: player.avatar,
          }}
          name={<PlayerName player={player} />}
          description={
            <div className="flex items-center gap-3 mt-2">
              <ColorIdentity identity={player.deck?.colors} size="sm" />
              {player.archetype}
            </div>
          }
        />

        {children && <div className="ml-auto">{children}</div>}

        {/* Edit Button (Only visible on hover) */}
        {editable && isHovered && (
          <Button
            color="primary"
            size="sm"
            variant="light"
            className="absolute top-1 right-1 opacity-90 hover:opacity-100 transition-opacity"
            onPress={onOpen}
          >
            <PencilIcon className="w-4 h-4" />
          </Button>
        )}
      </div>

      <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange}>
        <PlayerModalEdit playerId={playerId}  />
      </Modal>
    </>
  );
}

export default Player;
