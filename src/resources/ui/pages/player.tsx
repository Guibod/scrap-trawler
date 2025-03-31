import React from "react"
import { EventProvider, usePlayer } from "~/resources/ui/providers/event"
import PlayerSelector from "~/resources/ui/components/player/selector"
import { useNavigate, useParams } from "react-router-dom"
import { PlayerMatchesGraph } from "~/resources/ui/components/player/match.graph"
import { DeckProvider } from "~/resources/ui/components/deck/provider"
import PlayerDeck from "~/resources/ui/components/player/deck"
import PlayerName from "~/resources/ui/components/player/name"
import PlayerEdit from "~/resources/ui/components/player/edit"

export type EventPlayerPageProps = {
}

export default function EventPlayerPage({}: EventPlayerPageProps) {
  const { playerId, eventId } = useParams<{ playerId: string, eventId: string}>()
  const player = usePlayer(playerId)
  const navigate = useNavigate()

  return (
    <EventProvider>
      <div className="flex items-center justify-between mt-5 gap-5 p-5">
        <h3 className="text-3xl flex flex-auto"><PlayerName player={player} /></h3>
        <div className="ml-auto flex items-center justify-between flex-grow">
          <PlayerEdit playerId={player.id} />
          <PlayerSelector className="inline-block" value={playerId} onChange={(playerId) => navigate(`/event/${eventId}/player/${playerId}`)}/>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-3xl font-semibold">Match history</h3>
        <PlayerMatchesGraph player={player} />
      </div>

      <DeckProvider player={player}>
        <PlayerDeck className="space-y-4"/>
      </DeckProvider>
    </EventProvider>
  )
}
