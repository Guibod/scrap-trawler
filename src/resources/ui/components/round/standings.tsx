import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/table"
import Team from "~resources/ui/components/team"
import React from "react"
import type { RoundDbo } from "~resources/domain/dbos/round.dbo"
import Percentage from "~resources/ui/components/percentage"

interface EventPairingsProps {
  round: RoundDbo
}

const RoundStandings = ({round}: EventPairingsProps) => {
  return (
    <Table>
      <TableHeader>
        <TableColumn>Rank</TableColumn>
        <TableColumn>Player</TableColumn>
        <TableColumn>Points</TableColumn>
        <TableColumn>Record</TableColumn>
        <TableColumn aria-label="Game Win Percentage">GWP</TableColumn>
        <TableColumn aria-label="Opponent Game Win Percentage">OGWP</TableColumn>
        <TableColumn aria-label="Opponent Match Win Percentage">OMWP</TableColumn>
      </TableHeader>
      <TableBody emptyContent={"No standings yet for this round, use scrape button on EventLink.com page to add events."} items={Object.values(round.standings)}>
        {(standing) => (
          <TableRow>
            <TableCell>{standing.rank}</TableCell>
            <TableCell>
              <Team teamId={standing.id} />
            </TableCell>
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

export default RoundStandings