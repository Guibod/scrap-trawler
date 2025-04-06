import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/table"
import React from "react"
import Percentage from "~/resources/ui/components/percentage"
import { usePlayer } from "~/resources/ui/providers/event"

interface PlayerStandingsProps {
  playerId?: string
}

const PlayerStandings: React.FC<PlayerStandingsProps> = ({playerId}) => {
  const player = usePlayer(playerId)

  return (
    <Table>
      <TableHeader>
        <TableColumn>Round</TableColumn>
        <TableColumn>Rank</TableColumn>
        <TableColumn>Points</TableColumn>
        <TableColumn>Record</TableColumn>
        <TableColumn aria-label="Game Win Percentage">GWP</TableColumn>
        <TableColumn aria-label="Opponent Game Win Percentage">OGWP</TableColumn>
        <TableColumn aria-label="Opponent Match Win Percentage">OMWP</TableColumn>
      </TableHeader>
      <TableBody emptyContent={"No standings."} items={Object.entries(player.standings).map(([key, value]) => ({...value, round: key}))}>
        {(standing) => (
          <TableRow key={standing.round}>
            <TableCell>{standing.round}</TableCell>
            <TableCell>{standing.rank}</TableCell>
            <TableCell>
              {standing.matchPoints}
            </TableCell>
            <TableCell>
              {standing.wins} - {standing.losses} - {standing.draws}
            </TableCell>
            <TableCell>
              <Percentage ratio={standing.gameWinPercent} />
            </TableCell>
            <TableCell>
              <Percentage ratio={standing.opponentGameWinPercent} />
            </TableCell>
            <TableCell>
              <Percentage ratio={standing.opponentMatchWinPercent} />
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

export default PlayerStandings