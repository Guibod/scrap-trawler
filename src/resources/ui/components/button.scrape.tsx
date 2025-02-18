import React, { type CSSProperties, useEffect, useState } from "react"
import { scrapeEvent } from "~resources/ui/actions/scrape.event";
import { Button } from "@heroui/button";
import { ArchiveBoxArrowDownIcon } from "@heroicons/react/16/solid";
import { ScrapeStatus } from "~resources/domain/enums/status.dbo";
import statusColors from "~resources/ui/colors/status";
import { ContentAccessor } from "~resources/eventlink/content.accessor";
import { getEvent } from "~resources/ui/actions/get.event";
import type { UseButtonProps } from "@heroui/button/dist/use-button"

type ScrapButtonProps = {
  eventId?: string;
  organizationId?: string;
} & UseButtonProps;

const ButtonScrape: React.FC<ScrapButtonProps> = ({eventId, organizationId, ...props}: ScrapButtonProps) => {
  const [scrapeStatus, setScrapeStatus] = useState<ScrapeStatus>(ScrapeStatus.NOT_STARTED);
  const [isScraping, setIsScraping] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  if (!eventId) {
    eventId = ContentAccessor.getEventId(window.location.href);
    organizationId = ContentAccessor.getOrganizationId(window.location.href);
  }

  useEffect(() => {
    const loadScrapeStatus = async () => {
      setIsFetching(true);
      try {
        const event = await getEvent(eventId);
        setScrapeStatus(event.status.scrape);
      } catch (error) {
        console.error("Failed to fetch event status:", error);
      }
      setIsFetching(false);
    };
    loadScrapeStatus();
  }, [eventId]);

  const handleScrape = async () => {
    setIsScraping(true);
    try {
      const event = await scrapeEvent(eventId, organizationId);
      setScrapeStatus(event.event.status === "ENDED" ? ScrapeStatus.COMPLETED : ScrapeStatus.IN_PROGRESS);
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

  let className = `font-mtg bg-blue-600 text-white rounded-md gap-2 hover:bg-blue-700 disabled:bg-gray-400 transition ${props.className}`

  if (!props.isIconOnly) {
    className += "px-4 py-2 flex items-center justify-center";
  }

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
