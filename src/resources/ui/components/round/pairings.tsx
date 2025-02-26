import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/table"
import Team from "~resources/ui/components/team"
import MatchResult from "~resources/ui/components/match/result"
import React from "react"
import type { RoundDbo } from "~resources/domain/dbos/round.dbo"

interface EventPairingsProps {
  round: RoundDbo
}

const RoundPairings = ({round}: EventPairingsProps) => {
  return (
    <Table>
      <TableHeader>
        <TableColumn>Table #</TableColumn>
        <TableColumn>Player A</TableColumn>
        <TableColumn>Result</TableColumn>
        <TableColumn>Player B</TableColumn>
      </TableHeader>
      <TableBody emptyContent={"No matches yet, use scrape button on EventLink.com page to add events."} items={Object.values(round.matches)}>
        {(match) => (
          <TableRow>
            <TableCell>{match.tableNumber}</TableCell>
            <TableCell>
              <Team teamId={match.teamIds[0]} />
            </TableCell>
            <TableCell>
              <MatchResult match={match} />
            </TableCell>
            <TableCell>
              {match.isBye ? <span key="bye">Bye</span> : <Team teamId={match.teamIds[1]} />}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

export default RoundPairings