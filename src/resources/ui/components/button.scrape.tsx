import React from "react"
import { Button } from "@heroui/button"
import { ArchiveBoxArrowDownIcon, ExclamationCircleIcon } from "@heroicons/react/16/solid"
import { ScrapeStatus } from "~/resources/domain/enums/status.dbo"
import statusColors from "~/resources/ui/colors/status"
import type { UseButtonProps } from "@heroui/button/dist/use-button"
import { sendToBackground } from "@plasmohq/messaging"
import { getLogger } from "~/resources/logging/logger"
import { isScrapeResponseError, type ScrapeRequest, type ScrapeResponse } from "~/background/messages/eventlink/scrape"
import { ScrapeTrigger } from "~/resources/integrations/eventlink/types"

type ScrapButtonProps = {
  eventId?: string
  organizationId?: string
  fake?: boolean
} & UseButtonProps

const logger = getLogger("button-scrape")

const statusTextMap = {
  [ScrapeStatus.COMPLETED_LIVE]: {
    text: "Update event !",
    desc: "Last scrape recovered an ongoing event, it’s maybe time to update it!"
  },
  [ScrapeStatus.COMPLETED_ENDED]: {
    text: "Scrape again !",
    desc: "It seems like this event has already ended, but you can scrape it again!"
  },
  [ScrapeStatus.NOT_STARTED]: {
    text: "Scrape!",
    desc: "Scrape data from this event, it will be then available for pairing!"
  }
}

export const ButtonScrape: React.FC<ScrapButtonProps> = ({ eventId, organizationId, fake, ...props }) => {
  const {
    status,
    isScraping,
    isFetching,
    triggerScrape,
    error
  } = useScrapeStatus(eventId, organizationId, fake)

  if (!eventId) return null

  const { text, desc } = statusTextMap[status]

  const className = [
    "font-sans bg-blue-600 text-white rounded-md gap-2",
    !props.isIconOnly && "px-4 py-2 flex items-center justify-center",
    props.className
  ].filter(Boolean).join(" ")

  return (
    <>
      <Button
        {...props}
        onClick={triggerScrape}
        disabled={isScraping || isFetching}
        size="md"
        className={className}
        color="primary"
        aria-label={`Scrape event ${eventId}`}
        title={error ?? desc}
        isLoading={isScraping}
      >
        {error ? (
          <ExclamationCircleIcon aria-label="error-icon" className="h-5 w-5 fill-pink-300 stroke-red-700" />
        ) : (
          <ArchiveBoxArrowDownIcon aria-label="scrape-icon" className={`h-5 w-5 ${statusColors[status]}`} />
        )}
        {!props.isIconOnly && text}
      </Button>
    </>
  )
}

export default ButtonScrape

function useScrapeStatus(eventId?: string, organizationId?: string, fake?: boolean) {
  const [status, setStatus] = React.useState<ScrapeStatus>(ScrapeStatus.NOT_STARTED)
  const [isScraping, setIsScraping] = React.useState(false)
  const [isFetching, setIsFetching] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!eventId) return

    fetchStatus()
  }, [eventId, fake])

  const fetchStatus = async () => {
    setIsFetching(true)
    try {
      const event = fake
        ? await delayedPromise({ status: { scrape: ScrapeStatus.NOT_STARTED } })
        : await sendToBackground({ name: "back/event-get", body: { eventId } })

      setStatus(event?.status?.scrape ?? ScrapeStatus.NOT_STARTED)
      setError(null)
    } catch (e) {
      logger.debug("Failed to fetch event status:", e)
      const reason = e instanceof Error ? e.message : "Unknown error"
      setStatus(ScrapeStatus.NOT_STARTED)
      setError(`Scrape failed: ${reason}`)
    }
    setIsFetching(false)
  }

  const triggerScrape = async () => {
    if (!eventId || !organizationId) return

    setIsScraping(true)
    try {
      const event = fake
        ? await delayedPromise({ status: { scrape: ScrapeStatus.COMPLETED_ENDED }})
        : await sendToBackground<ScrapeRequest, ScrapeResponse>({
          name: "eventlink/scrape",
          body: { eventId, organizationId, trigger: ScrapeTrigger.MANUAL }
        })

      if(isScrapeResponseError(event)) {
        setStatus(ScrapeStatus.NOT_STARTED)
        setError(event.error.message)
      } else {
        setStatus(event.status?.scrape ?? ScrapeStatus.NOT_STARTED)
        setError(null)
      }
    } catch (e) {
      logger.exception(e)
    }
    setIsScraping(false)
  }

  return { status, isScraping, isFetching, triggerScrape, error }
}

function delayedPromise<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), 400))
}
