import { Cog6ToothIcon, EyeIcon } from "@heroicons/react/16/solid"
import EventView from "~/resources/ui/components/event/view"
import React, { useState } from "react"
import { useEvent } from "~/resources/ui/providers/event"
import EventEmpty from "~/resources/ui/components/event/empty"
import EventSetup from "~/resources/ui/components/event/setup"
import { ScrapeStatus } from "~/resources/domain/enums/status.dbo"
import ButtonScrape from "~/resources/ui/components/button.scrape"
import FetchStatus from "~/resources/ui/components/status/fetch"
import { Switch } from "@heroui/switch"

const EventContainer = () => {
  const { event, showSetupByDefault} = useEvent()
  const [isSetupMode, setIsSetupMode] = useState(showSetupByDefault)

  let component = <EventView />
  if (isSetupMode) {
    component = <EventSetup onQuitHandler={async () => setIsSetupMode(false)}/>
  }
  if (event?.status.scrape === ScrapeStatus.COMPLETED_DEAD) {
    component = <EventEmpty />
  }

  return (
    <div className="flex w-full flex-col">
      <div className="w-full bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-4xl font-bold font-mtg">{event.title} <span
          className="text-xl">{event.date.toLocaleDateString()}</span>
        </h1>

        <div className="flex items-center gap-5">
          {(event.status.scrape !== ScrapeStatus.COMPLETED_LIVE) && <ButtonScrape eventId={event.id} organizationId={event.organizer.id} />}
          <FetchStatus size="md" />

          <Switch id="mode-switch" isSelected={isSetupMode}
                  onChange={() => setIsSetupMode(!isSetupMode)}
                  thumbIcon={({ isSelected, className }) =>
                    isSelected ? <Cog6ToothIcon className={className} /> : <EyeIcon className={className} />
                  }
          >
            <span className="text-white">Setup Mode</span>
          </Switch>
        </div>
      </div>

      {component}
    </div>
  );
}

export default EventContainer