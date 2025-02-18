import React from "react"
import { Pagination, TableColumn } from "@heroui/react"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@heroui/table"
import { GlobalStatusIcon } from "~resources/ui/components/status.icons"
import { Button } from "@heroui/button"
import { DocumentArrowDownIcon, TrashIcon } from "@heroicons/react/24/outline"
import type { EventSummarizedDbo } from "~resources/domain/dbos/event.summarized.dbo"

type TableEventsProps = {
  events: Array<EventSummarizedDbo>;
  title: string;
  rowsPerPage?: number;
}

export default function TableEvents({ events, title = "Stored Events Table", rowsPerPage = 5 }: TableEventsProps) {
  const [page, setPage] = React.useState(1)

  const pages = Math.ceil(events.length / rowsPerPage)

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage
    const end = start + rowsPerPage

    return events.slice(start, end)
  }, [page, events])

  const viewEvent = (event) => {
    console.log("Viewing event:", event);
  };

  const downloadEvent = (event) => {
    console.log("Downloading event:", event);
  };

  const deleteEvent = (event) => {
    console.log("Deleting event:", event);
  };

  return (
    <Table
      aria-label={title}
      className="border-l shadow-md text-sm"
      classNames={{
        wrapper: "min-h-[222px]",
      }}
      isStriped bottomContent={
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
          <TableRow key={item.id} className="h-8 cursor-pointer" onClick={() => viewEvent(item)}>
            <TableCell className="px-1">
              <GlobalStatusIcon {...item} size={16} />
            </TableCell>
            <TableCell className="px-2">
              <div className={"flex flex-col items-start gap-0"}>
                <span className={"text-sm font-semibold"}>{item.name}</span>
                <span className={"text-xs text-gray-500"}>{item.date.toLocaleDateString()}</span>
                <span className={"text-xs text-gray-500"}>{item.organizer}</span>
              </div>
            </TableCell>
            <TableCell className="px-1">
              <Button variant="ghost" isIconOnly size="sm" onPress={() => downloadEvent(item)}
                      aria-label={`Download ${item.name}`}>
                <DocumentArrowDownIcon className="w-4 h-4" />
              </Button>
              <Button variant="ghost" isIconOnly size="sm" onPress={() => deleteEvent(item)}
                      aria-label={`Delete ${item.name}`}>
                <TrashIcon className="w-4 h-4" />
              </Button>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}