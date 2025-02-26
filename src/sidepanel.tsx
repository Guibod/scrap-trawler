import React from "react"
import { HeroUIProvider } from "@heroui/react"
import "~resources/ui/style.css"
import TableEvents from "~resources/ui/components/table.events"

const EventSidebar = () => {
  return (
    <HeroUIProvider>
      <div className="h-full overflow-y-auto p-3">
        <h2 className="text-lg font-semibold mb-3">Stored Events</h2>

        <TableEvents title="Stored Events Table" />
      </div>
    </HeroUIProvider>
  );
};

export default EventSidebar;