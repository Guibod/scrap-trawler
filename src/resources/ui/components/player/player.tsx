import { useEvent } from "~/resources/ui/providers/event"
import React, { useEffect, useState } from "react"
import { User } from "@heroui/user"
import { Button } from "@heroui/button"
import { PencilIcon } from "@heroicons/react/20/solid"
import PlayerName from "~/resources/ui/components/player/name"
import PlayerModalEdit from "~/resources/ui/components/player/edit.modal"
import { useDisclosure } from "@heroui/react"
import { Modal } from "@heroui/modal"
import { hashStringSHA1 } from "~/resources/utils/crypto"
import type { PlayerDbo } from "~/resources/domain/dbos/player.dbo"

export interface PlayerProps {
  playerId?: string
  player?: PlayerDbo
  editable?: boolean
  children?: React.ReactNode
}

const Player = ({ playerId, player, editable, children }: PlayerProps) => {
  const { event } = useEvent()
  const [avatar, setAvatar] = useState<string | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState(player ?? event.players[playerId])
  const [isHovered, setIsHovered] = useState(false) // Hover state
  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  useEffect(() => {
    if (!avatar) {
      createAvatarHash()
    }
    async function createAvatarHash() {
      const hash = await hashStringSHA1(currentPlayer.id)
      setAvatar(`https://www.gravatar.com/avatar/${hash}?d=identicon`)
    }
  }, [])

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
            src: avatar,
          }}
          name={<PlayerName player={currentPlayer} />}
          description={
            <div className="flex items-center space-x-5">
              {currentPlayer.overrides?.archetype || currentPlayer.archetype || currentPlayer.overrides?.displayName || currentPlayer.displayName}
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
