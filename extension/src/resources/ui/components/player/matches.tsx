import React from "react"
import { useEffect, useRef, useState } from "react"
import { useEvent, usePlayer, usePlayers } from "~/resources/ui/providers/event"
import { Avatar } from "@heroui/avatar"
import { Link } from "react-router-dom"
import PlayerName from "~/resources/ui/components/player/name"

export function PlayerMatches() {
  const { event } = useEvent()
  const player = usePlayer()
  const players = usePlayers()

  const containerRef = useRef<HTMLDivElement>(null)
  const [iconSize, setIconSize] = useState(48)

  const matches = player.matches ?? []

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      const width = containerRef.current?.clientWidth ?? 600
      const padding = 16
      const maxIconSize = 80
      const minIconSize = 32
      const idealSize = Math.floor((width - padding * 2) / matches.length) - 8
      setIconSize(Math.max(minIconSize, Math.min(idealSize, maxIconSize)))
    })

    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [matches.length])

  return (
    <div className="w-full overflow-x-auto py-2" ref={containerRef}>
      <div className="flex gap-10 px-2 justify-center">
        {matches.map((match, index) => {
          const opponentId = match.opponentPlayerIds[0]
          const opponent = players[opponentId]
          const score = `${match.result.wins}-${match.result.losses}-${match.result.draws}`

          const color =
            match.result.wins > match.result.losses
              ? "success"
              : match.result.wins < match.result.losses
                ? "danger"
                : "default"

          return (
            <Link key={match.matchId} to={`/event/${event.id}/player/${opponentId}`}>
              <div
                className="flex flex-col items-center relative"
                style={{ width: iconSize }}
              >
                <div className="ftext-xs text-center mb-2">Round #{match.round}</div>
                  <Avatar
                    src={opponent?.avatar}
                    isBordered
                    color={color}
                    className="rounded-full"
                    style={{ width: iconSize, height: iconSize }}
                  />
                  <PlayerName player={opponent} className="text-lg mt-3 block text-center" noIcons={true}/>
                <div className="text-xs text-center mt-1">{score}</div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
