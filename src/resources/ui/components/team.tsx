import { useEvent } from "~resources/ui/providers/event"
import Player from "~resources/ui/components/player/player"
import React from "react"
import { Card, CardBody, CardHeader } from "@heroui/card"

interface TeamProps {
  teamId: string
}

const Team = ({teamId}: TeamProps) => {
  const { event } = useEvent()
  const team = event.teams[teamId]

  if (!team) {
    return <div>unknown team #{teamId}</div>
  }

  if (team.players.length === 1) {
    return <Player playerId={team.players[0]} />
  }

  return (
    <Card>
      <CardHeader>{team.displayName}</CardHeader>
      <CardBody>
        {team.players.map((playerId) => <Player key={playerId} playerId={playerId} />)}
      </CardBody>
    </Card>
  )
}

export default Team