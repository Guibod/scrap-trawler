import { usePlayers } from "~/resources/ui/providers/event"
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/table"
import React from "react"
import PlayerName from "~/resources/ui/components/player/name"

const EventRegistration = () => {
 const players = usePlayers()

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
      <TableBody emptyContent={"No matches yet, use scrape button on EventLink.com page to add events."} items={Object.values(players)}>
        {(player) => (
          <TableRow aria-label={`player-${player.id}`} key={player.id}>
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