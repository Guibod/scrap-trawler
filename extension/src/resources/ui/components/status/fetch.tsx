import { useEventFetchStatus, useFetchService } from "~/resources/ui/providers/fetcher"
import React, { useEffect, useState } from "react"
import { CircularProgress } from "@heroui/react"
import { useEvent } from "~/resources/ui/providers/event"
import { Button } from "@heroui/button"

type FetchStatusProps = {
  size?: "sm" | "md" | "lg"
  allowRetry?: boolean
}

const FetchStatus: React.FC<FetchStatusProps> = ({ size = "md" }) => {
  const { event } = useEvent()
  const { fetchEvent } = useFetchService()
  const { isFetching, hasFailure, hasError, count, processed } = useEventFetchStatus(event.id)
  const [color, setColor] = useState<"success" | "warning" | "danger">("success")

  useEffect(() => {
    if (hasFailure && !hasError) {
      setColor("warning")
    } else if (hasFailure) {
      setColor("danger")
    }
  }, [hasFailure, hasError])

  if (isFetching) {
    return (
      <div className="flex justify-between items-center gap-2">
        <CircularProgress color={color} showValueLabel={true} value={processed} maxValue={count} aria-label="fetch-status-progress" size={size} />
        <span className="text-sm">Fetching decks...</span>
      </div>
    )
  }

  if (event.mapping){
    return (
      <Button onPress={() => fetchEvent(event.id)} size={size} color="primary" disabled={isFetching}>Fetch Decks</Button>
    )
  }
}

export default FetchStatus