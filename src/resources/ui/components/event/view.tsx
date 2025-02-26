import { Tab, Tabs } from "@heroui/tabs"
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/table"
import React, { useState } from "react"
import type { EventModel } from "~resources/domain/models/event.model"
import { Select, SelectItem } from "@heroui/react"
import MatchResult from "~resources/ui/components/match/result"
import Team from "~resources/ui/components/team"
import RoundPairings from "~resources/ui/components/round/pairings"
import RoundStandings from "~resources/ui/components/round/standings"
import { useEvent } from "~resources/ui/providers/event"
import EventRegistration from "~resources/ui/components/registration/registration"

const EventView = () => {
  const { event } = useEvent()
  const [currentRound, setCurrentRound] = useState(event.rounds[event.lastRound])
  const [rounds, setRounds] = useState(() => Object.values(event.rounds).map(round => ({
    key: round.roundNumber,
    label: `Round #${round.roundNumber}`,
  })));

  return (
    <div className="flex-1 p-6 bg-gray-100">
      <Select className="max-w-xs" label="Round" items={rounds} defaultSelectedKeys={[currentRound.roundNumber]} onSelectionChange={(keys) => {
        setCurrentRound(event.rounds[[...keys][0]])
      }}>
        {(round) => <SelectItem>{round.label}</SelectItem>}
      </Select>

      <Tabs defaultSelectedKey="pairings">
        <Tab value="pairings" title={<span>🔢 Round Pairings</span>}>
          <h2 className="text-lg font-mtg mb-4">Round Pairings</h2>
          <RoundPairings round={currentRound} />
        </Tab>
        <Tab value="standings" title={<span>📊 Standings</span>}>
          <h2 className="text-lg font-mtg mb-4">Standings</h2>
          <RoundStandings round={currentRound} />
        </Tab>
        <Tab value="registrations" title={<span>👤 Registration</span>}>
          <h2 className="text-lg font-bold mb-4">Registration</h2>
          <EventRegistration />
        </Tab>
      </Tabs>
    </div>
  );
}

export default EventView