import React, { useEffect, useState } from "react";
import { HeroUIProvider, Pagination, TableColumn } from "@heroui/react"
import { Table, TableBody, TableCell, TableRow, TableHeader } from "@heroui/table";
import { Button } from "@heroui/button";
import { ArrowPathIcon, StarIcon } from "@heroicons/react/24/solid";
import { DocumentArrowDownIcon, TrashIcon } from "@heroicons/react/24/outline";
import EventService from "~resources/domain/services/event.service";
import { GlobalStatusIcon } from "~resources/ui/components/status.icons";
import { MessageTypes } from "~resources/messages/message-types";
import "~resources/ui/style.css";
import TableEvents from "~resources/ui/components/table.events"

const service = new EventService();
const EventSidebar = () => {
  const [events, setEvents] = useState([]);

  const fetchEvents = async () => {
    setEvents(await service.listEvents());
  };
  const openBlank = async () => {
    chrome.runtime.sendMessage({ action: MessageTypes.OPEN_BLANK });
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