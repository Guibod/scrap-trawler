import React, { useEffect, useState } from "react"
import { eventScrape } from "~resources/ui/actions/event.scrape";
import { Button } from "@heroui/button";
import { ArchiveBoxArrowDownIcon} from "@heroicons/react/16/solid";
import { ScrapeStatus } from "~resources/domain/enums/status.dbo";
import statusColors from "~resources/ui/colors/status";
import type { UseButtonProps } from "@heroui/button/dist/use-button"
import { sendToBackground } from "@plasmohq/messaging"
import { addToast } from "@heroui/react"
import { useEvent } from "~resources/ui/providers/event"
import type { EventModel } from "~resources/domain/models/event.model"
import type { EventOrganizerDbo } from "~resources/domain/dbos/event.organizer.dbo"

type ScrapButtonProps = {
  event?: Pick<EventModel, "id" | "lastUpdated"> & { status: { scrape: ScrapeStatus}, organizer: Pick<EventOrganizerDbo, "id"> },
  notifiable?: boolean;
  useOnClick?: boolean;
} & UseButtonProps;

const ButtonScrape: React.FC<ScrapButtonProps> = ({event, notifiable = false, useOnClick=false, ...props}: ScrapButtonProps) => {
  const { event: eventFromContext } = useEvent();
  const currentEvent = event ?? eventFromContext;

  const [scrapeStatus, setScrapeStatus] = useState<ScrapeStatus>(ScrapeStatus.NOT_STARTED);
  const [isScraping, setIsScraping] = useState(false);
  const [hasFailed, setHasFailed] = useState<string | null>(null);

  useEffect(() => {
    setScrapeStatus(currentEvent.status.scrape);
  }, [currentEvent]);

  const handleScrape = async () => {
    setIsScraping(true);
    try {
      const scrapedEvent = await eventScrape(event.id, event.organizer.id, !!event.lastUpdated);
      setScrapeStatus(scrapedEvent.status.scrape);
    } catch (error) {
      if (notifiable) {
        addToast({
          title: "Failed to scrape event",
          description: error.message,
          hideIcon: true,
          color: "danger"
        });
      }
      setHasFailed(error.message)
    }
    setIsScraping(false);
  };

  const getButtonText = () => {
    if (scrapeStatus === ScrapeStatus.IN_PROGRESS) return "Update event !";
    if (scrapeStatus === ScrapeStatus.COMPLETED) return "Scrape again !";
    return "Scrape!";
  };

  const getButtonDescription = () => {
    if (scrapeStatus === ScrapeStatus.IN_PROGRESS) return "Last scrape recovered a ongoing event, it’s maybe time to update it!";
    if (scrapeStatus === ScrapeStatus.COMPLETED) return "It seems like this event has already ended, but you can scrape it again!";
    return "Scrape data from this event, it will be then available for pairing!";
  };

  let className = ` ${props.className}`
  if (!props.isIconOnly) {
    className += "px-4 py-2 flex items-center justify-center";
  }

  if (!currentEvent) return
  if (hasFailed) return

  return (
    <Button
      {...props}
      {...(useOnClick ? { onClick: handleScrape } : { onPress: handleScrape })}
      disabled={isScraping}
      size="md"
      className={className}
      color="primary"
      aria-label={getButtonDescription()}
      isLoading={isScraping}
    >
      <ArchiveBoxArrowDownIcon className={`h-5 w-5 ${statusColors[scrapeStatus]}`} />
      {!props.isIconOnly == true && getButtonText()}
    </Button>
  );
};

type ButtonScrapeEventLinkProps = {
  eventId: string;
  organizationId: string;
} & UseButtonProps;

/**
 * Variant dedicated to EventLink UI
 *
 * Since it relies on sendToBackground, it is aimed at content-scripts usage only
 * It also enforce styling to overcome styling issues in EventLink UI
 */
export const ButtonScrapeEventLink = ({ eventId, organizationId, ...props }: ButtonScrapeEventLinkProps) => {
  const [isFetching, setIsFetching] = useState(false);
  const [event, setEvent] = useState({
    // A faked event to avoid null checks
    id: eventId,
    organizer: {
      id: organizationId
    },
    status: {
      scrape: ScrapeStatus.NOT_STARTED
    },
    lastUpdated: null
  })

  useEffect(() => {
    if (eventId) {
      loadScrapeStatus();
    }
    return () => { }

    async function loadScrapeStatus () {
      setIsFetching(true);
      try {
        const recoveredEvent = await sendToBackground({ name: 'back/event-get', body: { eventId }});
        if (recoveredEvent) {
          setEvent(recoveredEvent);
        }
      } catch (error) {
        console.error("Failed to fetch event status:", error);
      }
      setIsFetching(false);
    }
  }, [eventId]);

  if (isFetching || !event) {
    return
  }

  return (
    <ButtonScrape
      event={event}
      notifiable={false}
      useOnClick={true}
      className="bg-blue-600 text-white rounded-md gap-2 hover:bg-blue-700 disabled:bg-gray-400 transition" {...props}
    />
  );
}

export default ButtonScrape;
