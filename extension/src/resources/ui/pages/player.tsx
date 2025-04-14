import React from "react"
import { EventProvider, usePlayer } from "~/resources/ui/providers/event"
import PlayerSelector from "~/resources/ui/components/player/selector"
import { useNavigate, useParams } from "react-router-dom"
import { DeckProvider } from "~/resources/ui/components/deck/provider"
import PlayerDeck from "~/resources/ui/components/player/deck"
import PlayerName from "~/resources/ui/components/player/name"
import PlayerEdit from "~/resources/ui/components/player/edit"
import { PlayerMatches } from "~/resources/ui/components/player/matches"
import PlayerStandings from "~/resources/ui/components/player/standings"
import { Button } from "@heroui/button"
import { useEventFetchStatus, useFetchService } from "~/resources/ui/providers/fetcher"

export type EventPlayerPageProps = {
}

export default function EventPlayerPage({}: EventPlayerPageProps) {
  const { playerId, eventId } = useParams<{ playerId: string, eventId: string}>()
  const player = usePlayer(playerId)
  const navigate = useNavigate()
  const { fetchDeckRows, } = useFetchService()
  const { isFetching } = useEventFetchStatus(eventId)


  return (
    <EventProvider>
      <div className="flex items-center justify-between mt-5 gap-5 p-5">
        <h3 className="text-3xl flex flex-auto"><PlayerName player={player} /></h3>
        <div className="ml-auto flex items-center justify-between flex-grow">
          <PlayerEdit playerId={player.id} />

          <Button className="ml-auto" onPress={() => fetchDeckRows(eventId, [{
            id: player.spreadsheetRowId,
            player: {},
            archetype: player.archetype,
            decklistUrl: player.decklistUrl,
            decklistTxt: player.decklistTxt,
            firstName: player.firstName,
            lastName: player.lastName,
          }])} size="md" color="primary" disabled={isFetching}>Fetch Deck</Button>

          <PlayerSelector className="inline-block" value={playerId} onChange={(playerId) => navigate(`/event/${eventId}/player/${playerId}`)}/>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <h3 className="text-2xl font-semibold">Match history</h3>
        <PlayerMatches />

        <h3 className="text-2xl font-semibold">Standings</h3>
        <PlayerStandings />

        <DeckProvider player={player}>
          <PlayerDeck className="space-y-4 mt-4"/>
        </DeckProvider>
      </div>
    </EventProvider>
  )
}
