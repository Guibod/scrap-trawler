import React, { useCallback, useEffect, useState } from "react"
import { addToast, type Selection } from "@heroui/react"
import { Pagination, TableColumn } from "@heroui/react"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@heroui/table"
import { Button } from "@heroui/button"
import EventService from "~/resources/domain/services/event.service"
import { useNavigate } from "react-router-dom"
import type { EventSummarizedDbo } from "~/resources/domain/dbos/event.summarized.dbo"
import { EventBus } from "~/resources/utils/event-bus"
import BulkDeletionButton from "~/resources/ui/components/button/delete.selection"
import { TrashIcon, DocumentArrowDownIcon } from '@heroicons/react/20/solid'
import { exportEventsToFile } from "~/resources/utils/export"
import type EventEntity from "~/resources/storage/entities/event.entity"
import { Input } from "@heroui/input"
import { useDebouncedValue } from "~/resources/utils/hooks"
import { FetchStatusIcon, PairStatusIcon, ScrapeStatusIcon } from "~/resources/ui/components/status/icons"

type TableEventsProps = {
  title?: string;
  rowsPerPage?: number;
  eventService?: EventService;
}

export default function TableEvents({ title = "Stored Events Table", rowsPerPage = 20, eventService = EventService.getInstance() }: TableEventsProps) {
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
  const [page, setPage] = useState(1)
  const [events, setEvents] = useState([]);
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")
  const [sortDescriptor, setSortDescriptor] = useState<{
    column: keyof EventEntity
    direction: "ascending" | "descending"
  }>({
    column: "date",
    direction: "descending"
  })

  const debouncedSearch = useDebouncedValue(search, 300)

  const fetchEvents = useCallback(async () => {
    setIsLoading(true)
    const result = await eventService.listEvents({
      page,
      pageSize: rowsPerPage,
      search: debouncedSearch,
      sort: sortDescriptor.column,
      direction: sortDescriptor.direction === "ascending" ? "asc" : "desc"
    })

    setEvents(result.data)
    setTotal(result.total)
    setIsLoading(false)
  }, [eventService, page, rowsPerPage, debouncedSearch, sortDescriptor])

  const downloadSelection = useCallback(async () => {
    let exportedKeys : string[] | null
    if (selectedKeys === 'all') {
      exportedKeys = null
    } else {
      exportedKeys = Array.from(selectedKeys).map(key => key.toString())
    }
    exportEventsToFile(exportedKeys)
      .then(() => {
        addToast({
          title: "Events Downloaded",
          description: "The selected events have been downloaded.",
          severity: "success"
        })
      })
  }, [selectedKeys])

  const deleteSelection = useCallback(async () => {
    let deleteKeys: string[] | 'all'
    if (selectedKeys === 'all') {
      deleteKeys = 'all'
    } else {
      deleteKeys = Array.from(selectedKeys).map(key => key.toString())
    }

    return eventService
      .delete(deleteKeys)
      .then(() => {
        addToast({
          title: "Event Deleted",
          description: "The selected event has been deleted.",
          severity: "warning"
        })
      })
  }, [selectedKeys, eventService])

  useEffect(() => {
    fetchEvents()

    const unsub = EventBus.on("storage:changed", ({ table }) => {
      if (table === "events") fetchEvents()
    })

    return () => unsub()
  }, [fetchEvents])

  const pages = Math.ceil(total / rowsPerPage)

  return (
    <Table
      aria-label={title}
      className="shadow-md text-sm"
      classNames={{
        wrapper: "min-h-[222px]",
      }}
      sortDescriptor={sortDescriptor}
      onSortChange={(descriptor) => {
        setPage(1)
        setSortDescriptor(descriptor as any);
      }}
      topContent={
        title && (
          <div>
            <h3 className="text-2xl font-bold">{title}</h3>
            <div className="flex gap-5 mt-2">
              <Button
                variant="solid"
                onPress={downloadSelection}
                aria-label="Download events"
                isDisabled={selectedKeys !== 'all' && selectedKeys.size === 0}
              >
                <DocumentArrowDownIcon className="w-4 h-4 fill-green-600 stroke-lime-50" />
                Download Selection
              </Button>
              <BulkDeletionButton
                selection={selectedKeys}
                onDeletion={deleteSelection}
                threshold={5}
                variant="solid"
                modalTitle="Are you sure you want to delete the selected events?">
                <TrashIcon className="w-4 h-4 fill-red-600 stroke-lime-50" />
                Delete Selection
              </BulkDeletionButton>

              <Input
                placeholder="Search events"
                value={search}
                onValueChange={(value) => {
                  setPage(1)
                  setSearch(value)
                }} />
            </div>
          </div>
        )
      }
      selectedKeys={selectedKeys}
      selectionMode="multiple"
      onSelectionChange={setSelectedKeys}
      topContentPlacement="inside"
      isStriped
      bottomContent={
      <div className="flex w-full justify-center">
        <Pagination
          isCompact
          showControls
          showShadow
          color="secondary"
          page={page}
          total={pages}
          onChange={(page) => setPage(page)}
        />
      </div>
    }>
      <TableHeader>
        <TableColumn>Status</TableColumn>
        <TableColumn key="date" allowsSorting>Date</TableColumn>
        <TableColumn key="title" allowsSorting>Event</TableColumn>
        <TableColumn key="format" allowsSorting>Format</TableColumn>
        <TableColumn>Organizer</TableColumn>
        <TableColumn>Players</TableColumn>
      </TableHeader>
      <TableBody emptyContent={"No events yet, use scrape button on EventLink.com page to add events."} items={events} isLoading={isLoading}>
        {(event: EventSummarizedDbo) => (
            <TableRow key={event.id} className="h-8 cursor-pointer" onClick={() => navigate(`/event/${event.id}`)}>
              <TableCell>
                <div className="flex gap-1">
                <ScrapeStatusIcon status={event.status} size={6} />
                <PairStatusIcon status={event.status} size={6} />
                <FetchStatusIcon status={event.status} size={6} />
                </div>
              </TableCell>
              <TableCell>
                {event.date.toLocaleDateString()}
              </TableCell>
              <TableCell className="text-large">{event.title}</TableCell>
              <TableCell>{event.format}</TableCell>
              <TableCell>{event.organizer}</TableCell>
              <TableCell>{event.players} / {event.capacity}</TableCell>
            </TableRow>
        )}
      </TableBody>
    </Table>
  )
}