import React from "react"
import { Button } from "@heroui/button"
import { ArchiveBoxArrowDownIcon, ExclamationCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/16/solid"
import { ScrapeStatus } from "~/resources/domain/enums/status.dbo"
import statusColors from "~/resources/ui/colors/status"
import type { UseButtonProps } from "@heroui/button/dist/use-button"
import { sendToBackground } from "@plasmohq/messaging"
import { getLogger } from "~/resources/logging/logger"
import { isScrapeResponseError, type ScrapeRequest, type ScrapeResponse } from "~/background/messages/eventlink/scrape"
import { ScrapeTrigger } from "~/resources/integrations/eventlink/types"
import { DEFAULT_MIN_DELAY_MS } from "~/resources/integrations/eventlink/event.scrape.runner"

type ScrapButtonProps = {
  eventId?: string
  organizationId?: string
  fake?: boolean
  autoDelay?: number
} & UseButtonProps

const logger = getLogger("button-scrape")

const statusTextMap: Record<ScrapeStatus, {text: string, desc: string, disabled: boolean}> = {
  [ScrapeStatus.COMPLETED_DEAD]: {
    text: "Scrape !",
    desc: "This event was already scraped, but contains no usable data",
    disabled: true
  },
  [ScrapeStatus.COMPLETED_LIVE]: {
    text: "Update event !",
    desc: "Last scrape recovered an ongoing event, it’s maybe time to update it!",
    disabled: false
  },
  [ScrapeStatus.COMPLETED_ENDED]: {
    text: "Scrape again !",
    desc: "It seems like this event has already ended, but you can scrape it again!",
    disabled: false
  },
  [ScrapeStatus.NOT_STARTED]: {
    text: "Scrape!",
    desc: "Scrape data from this event, it will be then available for pairing!",
    disabled: false
  }
}

export const ButtonScrape: React.FC<ScrapButtonProps> = ({ eventId, organizationId, fake, autoDelay, ...props }) => {
  const {
    status,
    isScraping,
    isFetching,
    triggerScrape,
    error,
    icon
  } = useScrapeStatus(eventId, organizationId, fake, autoDelay)

  if (!eventId) return null

  const { text, desc, disabled } = statusTextMap[status]

  const className = [
    "font-sans bg-blue-600 text-white rounded-md gap-2",
    !props.isIconOnly && "px-4 py-2 flex items-center justify-center",
    props.className
  ].filter(Boolean).join(" ")

  return (
    <>
      <Button
        {...props}
        onClick={() => triggerScrape()}
        disabled={disabled || isScraping || isFetching}
        size="md"
        className={className}
        color="primary"
        aria-label={`Scrape event ${eventId}`}
        title={error ?? desc}
        isLoading={isScraping}
      >
        {icon}
        {!props.isIconOnly && text}
      </Button>

      {error && !props.isIconOnly && <div className="border-red-800 fill-gray-100 text-red-500 text-sm">{error}</div>}
    </>
  )
}

export default ButtonScrape

function useScrapeStatus(eventId?: string, organizationId?: string, fake?: boolean, liveEventAutoDelay?: number) {
  const [status, setStatus] = React.useState<ScrapeStatus>(ScrapeStatus.NOT_STARTED)
  const [isScraping, setIsScraping] = React.useState(false)
  const [isFetching, setIsFetching] = React.useState(false)
  const [autoDelay, setAutoDelay] = React.useState<number>(liveEventAutoDelay ?? DEFAULT_MIN_DELAY_MS)
  const [error, setError] = React.useState<string | null>(null)

  function isLive(status: ScrapeStatus): boolean {
    return status === ScrapeStatus.COMPLETED_LIVE
  }

  React.useEffect(() => {
    if (!eventId || !organizationId || !isLive(status)) return

    const interval = setInterval(() => {
      triggerScrape(ScrapeTrigger.AUTOMATED)
    }, autoDelay)

    return () => clearInterval(interval)
  }, [eventId, organizationId, status, autoDelay])

  React.useEffect(() => {
    if (!eventId) return

    fetchStatus()
  }, [eventId, fake])

  const getIcon = () => {
    if (status === ScrapeStatus.COMPLETED_DEAD) {
      return (<ExclamationTriangleIcon aria-label="dead-icon" className="h-5 w-5 fill-black-500 stroke-black-700" />)
    }
    if (error) {
      return (<ExclamationCircleIcon aria-label="error-icon" className="h-5 w-5 fill-pink-300 stroke-red-700" />)
    }
    return (<ArchiveBoxArrowDownIcon aria-label="scrape-icon" className={`h-5 w-5 ${statusColors[status]}`} />)
  }

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

  const triggerScrape = async (trigger: ScrapeTrigger = ScrapeTrigger.MANUAL) => {
    if (!eventId || !organizationId) return

    setIsScraping(true)
    try {
      const event = fake
        ? await delayedPromise({ status: { scrape: ScrapeStatus.COMPLETED_ENDED }})
        : await sendToBackground<ScrapeRequest, ScrapeResponse>({
          name: "eventlink/scrape",
          body: { eventId, organizationId, trigger }
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

  return { status, isScraping, isFetching, triggerScrape, error, icon: getIcon() }
}

function delayedPromise<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), 400))
}
