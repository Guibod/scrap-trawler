import { useEvent, usePlayer } from "~/resources/ui/providers/event"
import React, { Fragment, useState } from "react"
import { User } from "@heroui/user"
import PlayerName from "~/resources/ui/components/player/name"
import ColorIdentity from "~/resources/ui/components/mana/identity"
import { Link } from "react-router-dom"
import PlayerEdit from "~/resources/ui/components/player/edit"

export interface PlayerProps {
  playerId?: string
  editable?: boolean
  children?: React.ReactNode
  link?: boolean
}

const Player = ({ playerId, editable, children, link = true }: PlayerProps) => {
  const { event } = useEvent()
  const player = usePlayer(playerId)
  const [isHovered, setIsHovered] = useState(false) // Hover state

  const Wrapper = link ? Link : Fragment
  const wrapperProps = link ? { to: `/event/${event.id}/player/${playerId}`, className: "block" } : {}

  return (
    <Wrapper {...wrapperProps}>
      <div
        className="relative group flex items-center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
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
          <PlayerEdit playerId={playerId} />
        )}
      </div>
    </Wrapper>
  );
}

export default Player;
