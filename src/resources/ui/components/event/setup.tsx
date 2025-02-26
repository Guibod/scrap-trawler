import { Card, CardBody, CardHeader } from "@heroui/card"
import { Input } from "@heroui/input"
import { Button } from "@heroui/button"
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/table"
import React from "react"
import { Alert } from "@heroui/alert"
import { PairStatus } from "~resources/domain/enums/status.dbo"
import { useEvent } from "~resources/ui/providers/event"

const EventSetup = () => {
  const { event } = useEvent()

  return (
    <div>
      {event.status.pair === PairStatus.NOT_STARTED && (
        <Alert isClosable={true} color="warning" description={
          <div>
            <p>This event is missing its spreadsheet configuration! To unlock Scrap Trawler's full potential, you'll need to provide a spreadsheet containing:</p>

            <ul className={"list-disc list-inside"}>
              <li><span className={"font-black"}>Decklists</span> – Link players to their decks</li>
              <li><span className={"font-black"}>Archetypes</span> – Categorize decks for analysis</li>
              <li><span className={"font-black"}>Private Data</span> – Any additional metadata for TO use</li>
            </ul>

            <p>Without this, Scrap Trawler can only display basic event data. Configure your spreadsheet now to enhance pairing, standings, and deck insights!</p>
          </div>
        } title="Event not configured yet" />
      )}

  <Card>
    <CardHeader className={"font-semibold text-danger"}>
      <p>This functionality is not yet implemented.</p>
    </CardHeader>
    <CardBody>
      <h2 className="text-lg font-mtg mb-4">Setup Mode - Pair Players & Decklists</h2>

      <p>Use top-right toggle button to switch to the event view</p>

      <div className="mb-4">
          <Input type="file" className="mt-2" label="Import Decklists" />
          <Button className="mt-2">Sync Google Sheets</Button>
        </div>
        <Table>
          <TableHeader>
            <TableColumn>Player Name</TableColumn>
            <TableColumn>Decklist</TableColumn>
            <TableColumn>Status</TableColumn>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Alice Smith</TableCell>
              <TableCell><Input type="text" defaultValue="moxfield.com/..." /></TableCell>
              <TableCell>x</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Bob Johnson</TableCell>
              <TableCell><Input type="text" placeholder="Enter decklist URL" /></TableCell>
              <TableCell>x</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Button className="mt-4 bg-green-600 text-white">🔒 Lock Decklists & Proceed</Button>
      </CardBody>
    </Card>
    </div>
  )
}

export default EventSetup