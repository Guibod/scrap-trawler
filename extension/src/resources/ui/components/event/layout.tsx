import { ScrapeStatus } from "~/resources/domain/enums/status.dbo"
import ButtonScrape from "~/resources/ui/components/button.scrape"
import FetchStatus from "~/resources/ui/components/status/fetch"
import { Switch } from "@heroui/switch"
import { Cog6ToothIcon, EyeIcon } from "@heroicons/react/16/solid"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import React from "react"
import { useEvent } from "~/resources/ui/providers/event"

const EventLayout: React.FC = () => {
  const { event } = useEvent()
  const location = useLocation()
  const navigate = useNavigate()

  const isSetup = location.pathname.includes("/setup")

  return (
    <div className="flex w-full flex-col">
      <div className="w-full bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-4xl font-bold font-mtg">
          <Link to={`/event/${event.id}`}>
            {event.title} <span className="text-xl">{event.date.toLocaleDateString()}</span>
          </Link>
        </h1>

        <div className="flex items-center gap-5">
          {(event.status.scrape !== ScrapeStatus.COMPLETED_LIVE) &&
            <ButtonScrape eventId={event.id} organizationId={event.organizer.id} />}
          <FetchStatus size="md" />

          <Switch
            id="mode-switch"
            isSelected={isSetup}
            onChange={() => navigate(isSetup ? "view" : "setup")}
            thumbIcon={({ isSelected, className }) =>
              isSelected ? <Cog6ToothIcon className={className} /> : <EyeIcon className={className} />
            }
          >
            <span className="text-white">Setup Mode</span>
          </Switch>
        </div>
      </div>

      <Outlet />
    </div>
  )
}

export default EventLayout