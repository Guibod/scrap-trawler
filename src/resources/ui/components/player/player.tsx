import { useEvent } from "~resources/ui/providers/event"
import React, { useEffect, useState } from "react"
import { User } from "@heroui/user"
import { Button } from "@heroui/button"
import { PencilIcon } from "@heroicons/react/20/solid"
import PlayerName from "~resources/ui/components/player/name"
import PlayerModalEdit from "~resources/ui/components/player/edit.modal"
import { useDisclosure } from "@heroui/react"
import { Modal } from "@heroui/modal"

interface PlayerProps {
  playerId: string
}

async function hashStringSHA1(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

const Player = ({ playerId }: PlayerProps) => {
  const { event } = useEvent()
  const [avatarHash, setAvatarHash] = useState<string | null>(null)
  const [player, setPlayer] = useState(event.players[playerId])
  const [isHovered, setIsHovered] = useState(false) // Hover state
  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  useEffect(() => {
    createAvatarHash()
    async function createAvatarHash() {
      const hash = await hashStringSHA1(player.id)
      setAvatarHash(hash)
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
            src: `https://www.gravatar.com/avatar/${avatarHash}?d=identicon`,
          }}
          name={<PlayerName player={player} />}
          description={
            <div className="flex items-center space-x-5">
              {player.overrides?.archetype || player.archetype || player.overrides?.displayName || player.displayName}
            </div>
          }
        />

        {/* Edit Button (Only visible on hover) */}
        {isHovered && (
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
        <PlayerModalEdit    playerId={playerId}  />
      </Modal>
    </>
  );
}

export default Player;
