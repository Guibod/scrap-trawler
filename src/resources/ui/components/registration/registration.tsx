import { useEvent } from "~resources/ui/providers/event"
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/table"
import Team from "~resources/ui/components/team"
import MatchResult from "~resources/ui/components/match/result"
import React from "react"
import PlayerName from "~resources/ui/components/player/name"

const EventRegistration = () => {
 const { event } = useEvent()

  return (
    <Table>
      <TableHeader>
        <TableColumn>Team Id</TableColumn>
        <TableColumn>Name</TableColumn>
        <TableColumn>Display Name</TableColumn>
        <TableColumn>Archetype</TableColumn>
        <TableColumn>Unique Identifier</TableColumn>
        <TableColumn>Table</TableColumn>
      </TableHeader>
      <TableBody emptyContent={"No matches yet, use scrape button on EventLink.com page to add events."} items={Object.values(event.players)}>
        {(player) => (
          <TableRow>
            <TableCell>{player.teamId}</TableCell>
            <TableCell><PlayerName player={player} /></TableCell>
            <TableCell>{player.displayName}</TableCell>
            <TableCell>{player.archetype}</TableCell>
            <TableCell>{player.id}</TableCell>
            <TableCell>{player.tableNumber}</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export default EventRegistration