import React, { useEffect, useState } from "react"
import { Pagination, TableColumn } from "@heroui/react"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@heroui/table"
import { GlobalStatusIcon } from "~/resources/ui/components/status.icons"
import { Button } from "@heroui/button"
import { DocumentArrowDownIcon, TrashIcon } from "@heroicons/react/24/outline"
import { eventDownloadJson } from "~/resources/ui/actions/event.download"
import { eventDelete } from "~/resources/ui/actions/event.delete"
import { eventOpen } from "~/resources/ui/actions/event.open"
import EventService from "~/resources/domain/services/event.service"
import { ArrowPathIcon } from "@heroicons/react/24/solid"

type TableEventsProps = {
  title: string;
  rowsPerPage?: number;
}

const isDate = (date: any): date is Date => date instanceof Date;

export default function TableEvents({ title = "Stored Events Table", rowsPerPage = 5 }: TableEventsProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [page, setPage] = useState(1)
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();

    async function fetchEvents() {
      setEvents(await EventService.getInstance().listEvents());
    };
  }, [refreshTrigger]);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage
    const end = start + rowsPerPage
    return events.slice(start, end)
  }, [page, events])

  const pages = Math.ceil(events.length / rowsPerPage)
  const refresh = () => setRefreshTrigger(refreshTrigger + 1)

  return (
    <Table
      aria-label={title}
      className="shadow-md text-sm"
      classNames={{
        wrapper: "min-h-[222px]",
      }}
      topContent={
        <Button onPress={refresh} variant="flat" isIconOnly size="sm" title={"Refresh"}>
          <ArrowPathIcon className="w-5 h-5" />
        </Button>
      }
      topContentPlacement="outside"
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
        <TableColumn hideHeader={true}>Status</TableColumn>
        <TableColumn>Event</TableColumn>
        <TableColumn hideHeader={true}>Actions</TableColumn>
      </TableHeader>
      <TableBody emptyContent={"No events yet, use scrape button on EventLink.com page to add events."} items={items}>
        {(item) => (
          <TableRow key={item.id} className="h-8 cursor-pointer" onClick={() => eventOpen(item.id)}>
            <TableCell className="px-1">
              <GlobalStatusIcon {...item} size={16} />
            </TableCell>
            <TableCell className="px-2">
              <div className={"flex flex-col items-start gap-0"}>
                <span className={"text-sm font-semibold"}>{item.title}</span>
                <span className={"text-xs text-gray-500"}>{isDate(item.date) ? item.date.toLocaleDateString() : item.date}</span>
                <span className={"text-xs text-gray-500"}>{item.organizer}</span>
              </div>
            </TableCell>
            <TableCell className="px-1">
              <Button variant="ghost" isIconOnly size="sm" onPress={() => eventDownloadJson(item.id)}
                      aria-label={`Download ${item.title}`}>
                <DocumentArrowDownIcon className="w-4 h-4" />
              </Button>
              <Button variant="ghost" isIconOnly size="sm" onPress={() => eventDelete(item.id).then(refresh)}
                      aria-label={`Delete ${item.title}`}>
                <TrashIcon className="w-4 h-4" />
              </Button>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}