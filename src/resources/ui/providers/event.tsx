import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import type { EventModel } from "~/resources/domain/models/event.model";
import { Spinner } from "@heroui/react"
import lostImage from "data-base64:~/../assets/lost.png"
import { PairStatus } from "~/resources/domain/enums/status.dbo"
import { EventScrapeStateDbo } from "~/resources/domain/enums/event.scrape.state.dbo"
import { getLogger } from "~/resources/logging/logger"
import type { OverrideDbo } from "~/resources/domain/dbos/player.dbo"
import { useParams } from "react-router-dom"
import EventService from "~/resources/domain/services/event.service"
import type { WotcId } from "~/resources/domain/dbos/identifiers.dbo"
import type { PlayerStatusDbo } from "~/resources/domain/enums/player.status.dbo"
import type { PairingMode } from "~/resources/domain/dbos/mapping.dbo"
import type { DeckDbo } from "~/resources/domain/dbos/deck.dbo"
import type { SpreadsheetRow } from "~/resources/domain/dbos/spreadsheet.dbo"
import { PlayerMapper, type PlayerProfile } from "~/resources/domain/mappers/player.mapper"

const logger = getLogger("event-provider")

// Define context type
class EventContextType {
  event: EventModel | null;
  showSetupByDefault: boolean;
  updatePlayerOverride: (playerId: string, overrideData: Partial<OverrideDbo>) => Promise<EventModel>;
  updateEvent: (event: Partial<EventModel>) => Promise<EventModel>;
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

  const showSetupByDefault = event?.scrapeStatus !== EventScrapeStateDbo.PURGED
    && event?.status?.pair !== PairStatus.COMPLETED;
  const value = useMemo(() => ({
    event,
    showSetupByDefault,
    updateEvent: async (updatedEvent: Partial<EventModel>): Promise<EventModel> => {
      if (!event) return; // Ensure event exists before modifying

      return eventService.save({ ...event, ...updatedEvent })
          .then(model => {
            setEvent(model)
            return model
          });
    },
    updatePlayerOverride: async (playerId: string, overrideData: OverrideDbo): Promise<EventModel> => {
      if (!event) return; // Ensure event exists before modifying

      const player = event.players[playerId];
      if (!player) return; // Prevent errors if player doesn't exist

      // Merge new override data with existing data
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

      return eventService.save(updatedEvent)
          .then(model => {
            setEvent(model)
            return model
          })
    }
  }), [event]);

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

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}

export function usePlayer(playerId: string): PlayerProfile {
  const { event } = useEvent()

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