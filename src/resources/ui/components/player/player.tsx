import { useEvent } from "~resources/ui/providers/event"
import React, { useEffect, useState } from "react"
import { User } from "@heroui/user"
import PlayerName from "~resources/ui/components/player/name"

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

const Player = ({playerId}: PlayerProps) => {
  const { event } = useEvent()
  const [avatarHash, setAvatarHash] = useState(null)
  const [player, setPlayer] = useState(event.players[playerId])

  useEffect(() => {
    createAvatarHash()
    async function createAvatarHash() {
      const hash = await hashStringSHA1(player.id)
      setAvatarHash(hash)
    }
  }, [])

  return (
    <User
      avatarProps={{
        src: `https://www.gravatar.com/avatar/${avatarHash}?d=identicon`,
      }}
      name={<PlayerName player={player} />}
      description={
        <div className={`flex items-center space-x-5`}>
          {player.archetype || player.displayName}
        </div>
      }
    />
  );
}

export default Player