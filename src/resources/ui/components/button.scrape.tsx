import React, { useEffect, useState } from "react"
import { eventScrape } from "~resources/ui/actions/event.scrape"
import { Button } from "@heroui/button"
import { ArchiveBoxArrowDownIcon } from "@heroicons/react/16/solid"
import { ScrapeStatus } from "~resources/domain/enums/status.dbo"
import statusColors from "~resources/ui/colors/status"
import type { UseButtonProps } from "@heroui/button/dist/use-button"
import { sendToBackground } from "@plasmohq/messaging"
import { getLogger } from "~resources/logging/logger"

type ScrapButtonProps = {
  eventId?: string;
  organizationId?: string;
  fake?: boolean
} & UseButtonProps;

const logger = getLogger("button-scrape")

const delayedPromise = (value: any) =>
  new Promise<any>((resolve) => setTimeout(() => resolve(value), 400));

const ButtonScrape: React.FC<ScrapButtonProps> = ({eventId, organizationId, fake, ...props}: ScrapButtonProps) => {
  const [scrapeStatus, setScrapeStatus] = useState<ScrapeStatus>(ScrapeStatus.NOT_STARTED);
  const [isScraping, setIsScraping] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (eventId) {
      loadScrapeStatus();
    }

    async function loadScrapeStatus () {
      let event
      setIsFetching(true);
      try {
        if (fake) {
          event = await delayedPromise({
            status: {
              scrape: ScrapeStatus.NOT_STARTED
            }
          })
        } else {
          event = await sendToBackground({ name: 'back/event-get', body: { eventId }});
        }
        setScrapeStatus(event.status.scrape);
      } catch (error) {
        logger.debug("Failed to fetch event status:", error);
        setScrapeStatus(ScrapeStatus.NOT_STARTED);
      }
      setIsFetching(false);
    }
  }, [eventId]);

  const handleScrape = async () => {
    let event
    setIsScraping(true);
    try {
      if (fake) {
        event = await delayedPromise({
          status: {
            scrape: ScrapeStatus.COMPLETED
          }
        })
      } else {
        event = await eventScrape(eventId, organizationId);
      }
      setScrapeStatus(event.status.scrape);
    } catch (error) {
      console.error("Scraping failed:", error);
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
  let className = `font-sans bg-blue-600 text-white rounded-md gap-2 ${props.className}`

  if (!props.isIconOnly) {
    className += " px-4 py-2 flex items-center justify-center";
  }

  if (!eventId) return;

  return (
    <Button
      {...props}
      onClick={handleScrape}
      disabled={isScraping || isFetching}
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

export default ButtonScrape;
