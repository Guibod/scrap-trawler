import { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import { EventStorage } from "~scripts/storage/event-storage"
import { HeroUIProvider } from "@heroui/system"

const EventSidebar = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function fetchEvents() {
      const storedEvents = await EventStorage.listEvents();
      setEvents(storedEvents);
    }
    fetchEvents();
  }, []);

  return (
    <HeroUIProvider disableAnimation={true}>
      <div className="w-80 p-4 bg-white border-l shadow-lg h-full overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Stored Events</h2>
      {events.length === 0 ? (
        <p className="text-gray-500">No stored events.</p>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <Card key={event.id} className="p-2 border">
              <div className="flex flex-col p-4">
                <span className="text-sm text-gray-700">{event.id}</span>
                <span className="font-semibold">{event.name}</span>
                <span className="text-sm text-gray-600">{event.organizer}</span>
                <span className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString()}</span>
                <div className="mt-2 flex gap-2">
                  <Button color="primary" variant="ghost" size="sm">View</Button>
                  <Button color="secondary" variant="ghost" size="sm">Download</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
    </HeroUIProvider>
  );
};

export default EventSidebar;
