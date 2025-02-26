import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import type { EventModel } from "~resources/domain/models/event.model";
import { Spinner } from "@heroui/react"
import { HeroUIProvider } from "@heroui/system"
import lostImage from "data-base64:~/../assets/lost.png"
import { PairStatus } from "~resources/domain/enums/status.dbo"
import { eventService } from "~background/singletons"
import { EventScrapeStateDbo } from "~resources/domain/enums/event.scrape.state.dbo"

// Define context type
interface EventContextType {
  event: EventModel | null;
  showSetupByDefault: boolean
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function useEvent() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEvent must be used within an EventProvider");
  }
  return context;
}

export function EventProvider({ eventId, children }: { eventId?: string; children: React.ReactNode }) {
  const [currentEventId, setCurrentEventId] = useState<string | null>(eventId);
  const [event, setEvent] = useState<EventModel | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCurrentEventId(params.get("eventId"));
  }, [])

  useEffect(() => {
    if (currentEventId) {
      fetchEvent()
    }

    async function fetchEvent() {
      setIsFetching(true)
      eventService.getEvent(currentEventId)
        .then((event) => {
          setEvent(event)
          setIsFetching(false)
          console.log("EventProvider current event", event)
        })
    }
  }, [currentEventId]);

  const showSetupByDefault = event?.scrapeStatus !== EventScrapeStateDbo.PURGED && event?.status?.pair === PairStatus.NOT_STARTED;
  const value = useMemo(() => ({ event, showSetupByDefault }), [event]);

  if (isFetching) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
        <Spinner size="lg" color="primary" label="Please wait while recovering the event"  />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center relative">
        {/* Centered Text */}
        <div className="text-center">
          <h1 className="font-mtg text-4xl">Event not found</h1>
          <p>If there is a bug, please read "Event cannot be recovered" instead. </p>
          <p className={"text-xs"}>Sorry for the inconvenience 😘</p>
        </div>

        {/* Image at Bottom */}
        <img
          src={lostImage}
          alt="Not found"
          className="w-32 absolute bottom-4"
        />
      </div>
    )
  }

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}
