import React, { useEffect, useState } from "react"
import { HeroUIProvider } from "@heroui/react"
import { Button } from "@heroui/button"
import { ArrowPathIcon, StarIcon } from "@heroicons/react/24/solid"
import EventService from "~resources/domain/services/event.service"
import "~resources/ui/style.css"
import TableEvents from "~resources/ui/components/table.events"
import { sendToBackground } from "@plasmohq/messaging"
import { openBlank } from "~resources/ui/actions/blank.open"

const service = new EventService();
const EventSidebar = () => {
  const [events, setEvents] = useState([]);

  const fetchEvents = async () => {
    setEvents(await service.listEvents());
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <HeroUIProvider>
      <div className="h-full overflow-y-auto p-3">
        <h2 className="text-lg font-semibold mb-3">Stored Events</h2>
        <div className="flex space-x-2 mb-3">
          <Button onPress={fetchEvents} variant="flat" isIconOnly size="sm">
            <ArrowPathIcon className="w-5 h-5" />
          </Button>
          <Button onPress={openBlank} variant="flat" isIconOnly size="sm">
            <StarIcon className="w-5 h-5" />
          </Button>
        </div>

        <TableEvents events={events} title="Stored Events Table" />
      </div>
    </HeroUIProvider>
  );
};

export default EventSidebar;