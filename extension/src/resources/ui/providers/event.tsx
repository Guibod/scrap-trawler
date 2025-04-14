import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react"
import type { EventModel } from "~/resources/domain/models/event.model";
import { Spinner } from "@heroui/react"
import lostImage from "data-base64:~/../assets/lost.png"
import { PairStatus, ScrapeStatus } from "~/resources/domain/enums/status.dbo"
import type { OverrideDbo } from "~/resources/domain/dbos/player.dbo"
import { useParams } from "react-router-dom"
import EventService from "~/resources/domain/services/event.service"
import { PlayerMapper, type PlayerProfile } from "~/resources/domain/mappers/player.mapper"
import { EventBus } from "~/resources/utils/event-bus"

// Define context type
export class EventContextType {
  event: EventModel | null;
  showSetupByDefault: boolean;
  updatePlayerOverride: (playerId: string, overrideData: Partial<OverrideDbo>) => Promise<EventModel>;
  updateEvent: (event: Partial<EventModel>) => Promise<EventModel>;
  refreshEvent: () => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function useEvent() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEvent must be used within an EventProvider");
  }
  return context;
}

export type EventProviderProps = {
  children: React.ReactNode;
  service?: EventService
}

export function EventProvider({ service = EventService.getInstance(), children }: EventProviderProps) {
  const { eventId } = useParams();
  const [eventService] = useState(service);
  const [event, setEvent] = useState<EventModel | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchEvent()
    }

    async function fetchEvent() {
      setIsFetching(true)
      eventService.get(eventId)
        .then((event) => {
          setEvent(event)
          setIsFetching(false)
          console.log("EventProvider current event", event)
        })
    }
  }, [eventId]);

  const value = useMemo(() => ({
    event,
    showSetupByDefault: event?.status.scrape !== ScrapeStatus.COMPLETED_DEAD
      && event?.status?.pair !== PairStatus.COMPLETED
  }), [event]);

  const refreshEvent = useCallback(() => {
    if (!eventId) return;
    eventService.get(eventId).then((fetched) => {
      setEvent(fetched);
    });
  }, [eventId, eventService]);


  useEffect(() => {
    return EventBus.on("storage:changed", ({ table, key }) => {
      if (table === "events" && key === eventId) {
        refreshEvent();
      }
    });
  }, [eventId, refreshEvent]);

  const updateEvent = useCallback(async (updatedEvent: Partial<EventModel>): Promise<EventModel> => {
    if (!event) return;

    const model = await eventService.save({ ...event, ...updatedEvent });
    setEvent(model);
    return model;
  }, [event, eventService]);

  const updatePlayerOverride = useCallback(async (playerId: string, overrideData: OverrideDbo): Promise<EventModel> => {
    if (!event) return;

    const player = event.players[playerId];
    if (!player) return;

    const updatedOverride = Object.values({ ...player.overrides, ...overrideData }).some(Boolean)
      ? { ...player.overrides, ...overrideData }
      : null;

    const updatedEvent = {
      ...event,
      players: {
        ...event.players,
        [playerId]: {
          ...player,
          overrides: updatedOverride,
        },
      },
    };

    const model = await eventService.save(updatedEvent);
    setEvent(model);
    return model;
  }, [event, eventService]);

  if (isFetching) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
        <Spinner size="lg" color="primary" label="Please wait while recovering the event"  />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex w-full flex-col items-center justify-center relative">
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

  return <EventContext.Provider value={{
    ...value,
    updateEvent,
    updatePlayerOverride,
    refreshEvent
  }}>{children}</EventContext.Provider>;
}

export function usePlayer(explicitPlayerId?: string): PlayerProfile {
  const { playerId: routePlayerId } = useParams<{ playerId: string }>()
  const { event } = useEvent()

  const playerId = explicitPlayerId ?? routePlayerId

  if (!playerId) {
    throw new Error("usePlayer must be called with a playerId or exist in the route with playerId param")
  }

  if (!event) {
    throw new Error("usePlayer called before event is loaded")
  }

  return PlayerMapper.toProfile(event, playerId)
}
export function usePlayers(): Record<string, PlayerProfile> {
  const { event } = useEvent()

  if (!event) {
    throw new Error("usePlayer called before event is loaded")
  }

  return Object.fromEntries(
    Object.keys(event.players)
      .map(playerId => [playerId, PlayerMapper.toProfile(event, playerId)])
  )
}