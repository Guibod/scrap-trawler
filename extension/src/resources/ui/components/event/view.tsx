import { Tab, Tabs } from "@heroui/tabs"
import React, { useState } from "react"
import { Select, SelectItem } from "@heroui/react"
import RoundPairings from "~/resources/ui/components/round/pairings"
import RoundStandings from "~/resources/ui/components/round/standings"
import { useEvent } from "~/resources/ui/providers/event"
import EventRegistration from "~/resources/ui/components/registration/registration"
import { EventSetupProvider } from "~/resources/ui/components/event/setup/provider"

const EventView = () => {
  const { event } = useEvent()
  const [currentRound, setCurrentRound] = useState(event.rounds[event.lastRound])
  const [rounds, setRounds] = useState(() => Object.values(event.rounds).map(round => ({
    key: round.roundNumber,
    label: `Round #${round.roundNumber}`,
  })));

  return (

      <div className="p-6 relative">
        <Select aria-label="event-round-selector" className="max-w-xs absolute top-0 right-0 mt-2" label="Round" items={rounds} defaultSelectedKeys={[currentRound.roundNumber]} onSelectionChange={(keys) => {
          setCurrentRound(event.rounds[[...keys][0]])
        }}>
          {(round) => <SelectItem>{round.label}</SelectItem>}
        </Select>

        <Tabs defaultSelectedKey="pairings">
          <Tab value="pairings" title={<span>🔢 Round Pairings</span>}>
            <RoundPairings round={currentRound} />
          </Tab>
          <Tab value="standings" title={<span>📊 Standings</span>}>
            <RoundStandings round={currentRound} />
          </Tab>
          <Tab value="registrations" title={<span>👤 Registration</span>}>
            <EventRegistration />
          </Tab>
        </Tabs>
      </div>
  );
}

export default EventView