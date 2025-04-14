import React, {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react"
import DeckFetchService, { EventFetchStatus } from "~/resources/integrations/decks/service"
import { addToast, type ToastProps } from "@heroui/react"
import type { SpreadsheetRow } from "~/resources/domain/dbos/spreadsheet.dbo"
import { DeckFetchRequest } from "~/resources/integrations/decks/request"

interface FetchContextType {
  fetchEvent: (eventId: string) => Promise<void>
  fetchDeckRows: (eventId: string, rows: SpreadsheetRow[]) => Promise<void>
  cancelEvent: (eventId: string) => void
  cancelAll: () => void
}

interface FetchStatus {
  isFetching: boolean
  count: number
  processed: number
  hasError: boolean
  hasFailure: boolean
}

const defaultStatus: FetchStatus = { isFetching: false, count: 0, processed: 0, hasError: false, hasFailure: false }

const FetchContext = createContext<FetchContextType | undefined>(undefined)
const FetchStatusStoreContext = createContext<{
  statusMap: React.MutableRefObject<Map<string, FetchStatus>>
  subscribers: React.MutableRefObject<Map<string, Set<() => void>>>
} | undefined>(undefined)

export type FetchServiceProviderProps = {
  children: ReactNode
  service?: DeckFetchService
}

const statusDescription: Record<EventFetchStatus, {
  description: string,
  severity: ToastProps["severity"]
}> = {
  [EventFetchStatus.PENDING]: { description: "Deck recovery has not started yet", severity: "default" },
  [EventFetchStatus.SUCCESS]: { description: "All decks have been recovered", severity: "success" },
  [EventFetchStatus.PARTIAL]: { description: "Some decks have not been recovered", severity: "warning" },
  [EventFetchStatus.FAILED]: { description: "An error occurred while fetching decks", severity: "danger" },
}

export const FetchServiceProvider = ({ children, service }: FetchServiceProviderProps) => {
  const fetchService = useMemo(() => service ?? DeckFetchService.getInstance(), [])

  const statusMap = useRef(new Map<string, FetchStatus>())
  const subscribers = useRef(new Map<string, Set<() => void>>())

  const notify = useCallback((eventId: string) => {
    subscribers.current.get(eventId)?.forEach((fn) => fn())
  }, [])

  const setFetching = useCallback(
    (eventId: string, isFetching: boolean, count = 0, processed = 0, hasError = false, hasFailure= false) => {
      statusMap.current.set(eventId, { isFetching, count, processed, hasError, hasFailure })
      notify(eventId)
    },
    [notify]
  )

  useEffect(() => {
    fetchService.setOnProgress((eventId, processed, count, hasError, hasFailure) => {
      setFetching(eventId, true, count, processed, hasError, hasFailure)
    })
    fetchService.setOnEventStart((eventId) => {
      fetchService.eventService.get(eventId).then((event) => {
        addToast({
          title: `Deck fetch for ${event?.title}`,
          description: `Recovering decks...`,
          severity: "primary",
        })
      })
    })
    fetchService.setOnEventComplete((eventId, status, count) => {
      fetchService.eventService.get(eventId).then((event) => {
        setFetching(eventId, false, count)
        addToast({
          title: `Deck fetch for ${event?.title}`,
          description: statusDescription[status].description,
          severity: statusDescription[status].severity,
        })
      })
    })
  }, [fetchService, setFetching])

  const cancelEvent = useCallback(
    async (eventId: string) => {
      await fetchService.cancelEvent?.(eventId)
        .then(() => {
          addToast({
            title: "Fetch cancelled for event",
            description: `Event ${eventId} has been cancelled`,
            severity: "warning",
          })
          setFetching(eventId, false)
        })
        .catch(() => {})
    },
    [fetchService, setFetching]
  )

  const cancelAll = useCallback(async () => {
    await fetchService.cancelAll().then(() => {
      addToast({
        title: "All fetch cancelled",
        description: `Every fetch action have been cancelled`,
        severity: "warning",
      })
      statusMap.current.clear()
      subscribers.current.forEach((subs) => subs.forEach((fn) => fn()))
    })
  }, [fetchService])

  const fetchEvent = useCallback(
    async (eventId: string): Promise<void> => {
      if (statusMap.current.get(eventId)?.isFetching) {
        await cancelEvent(eventId)
      }
      fetchService.eventService.get(eventId).then((event) => {
        const requests = DeckFetchRequest.fromEvent(event)
        setFetching(eventId, true, requests.length)
        fetchService.schedule(requests)
      })
    },
    [fetchService, cancelEvent, setFetching]
  )

  const fetchDeckRows = useCallback(
    async (eventId: string, rows: SpreadsheetRow[]): Promise<void> => {
      if (statusMap.current.get(eventId)?.isFetching) {
        await cancelEvent(eventId)
      }
      fetchService.eventService.get(eventId).then((event) => {
        const requests = DeckFetchRequest.fromRows(event, rows)
        setFetching(eventId, true, requests.length)
        fetchService.schedule(requests)
      })
    },
    [fetchService, cancelEvent, setFetching]
  )

  const contextValue = useMemo(
    () => ({
      fetchEvent,
      fetchDeckRows,
      cancelEvent,
      cancelAll,
    }),
    [fetchEvent, fetchDeckRows, cancelEvent, cancelAll]
  )

  return (
    <FetchContext.Provider value={contextValue}>
      <FetchStatusStoreContext.Provider value={{ statusMap, subscribers }}>
        {children}
      </FetchStatusStoreContext.Provider>
    </FetchContext.Provider>
  )
}

export const useFetchService = (): FetchContextType => {
  const ctx = useContext(FetchContext)
  if (!ctx) throw new Error("useFetch must be used within a FetchServiceProvider")
  return ctx
}

export const useEventFetchStatus = (eventId: string): FetchStatus => {
  const ctx = useContext(FetchStatusStoreContext)
  if (!ctx) throw new Error("useEventFetchStatus must be used within FetchServiceProvider")

  const { statusMap, subscribers } = ctx

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!subscribers.current.has(eventId)) {
        subscribers.current.set(eventId, new Set())
      }
      const subs = subscribers.current.get(eventId)!
      subs.add(onStoreChange)
      return () => subs.delete(onStoreChange)
    },
    [eventId, subscribers]
  )

  const getSnapshot = useCallback(() => {
    return statusMap.current.get(eventId) ?? defaultStatus
  }, [eventId, statusMap])

  return useSyncExternalStore(subscribe, getSnapshot)
}
