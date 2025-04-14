import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal"
import { Button } from "@heroui/button"
import { useState } from "react"
import { createRoot } from "react-dom/client"
import { Table, TableHeader, TableRow, TableColumn, TableBody, TableCell } from "@heroui/table"
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid"
import type { SortDescriptor } from "@heroui/react"
import { Alert } from "@heroui/alert"
import type { SheetTab } from "~/resources/domain/parsers/importers/types"

type SheetSelectorModalProps = {
  sheets: SheetTab[]
  title: string
  hasDiscrepancy: boolean
  onSelect: (sheet: SheetTab) => void
  onCancel: () => void
}

export const SheetSelectorModal: React.FC<SheetSelectorModalProps> = ({
                                                                        sheets,
                                                                        title = "Select a sheet tab",
                                                                        hasDiscrepancy = false,
                                                                        onSelect,
                                                                        onCancel
                                                                      }) => {
  const [selected, setSelected] = useState<string | null>(null)
  const [sort, setSort] = useState<SortDescriptor>({ column: "index", direction: "ascending" })

  const sortedSheets = [...sheets].sort((a, b) => {
    const dir = sort.direction === "ascending" ? 1 : -1
    switch (sort.column) {
      case "title":
        return a.title.localeCompare(b.title) * dir
      case "id":
        return a.id.localeCompare(b.id) * dir
      case "rowCount":
        return (a.rowCount - b.rowCount) * dir
      case "columnCount":
        return (a.columnCount - b.columnCount) * dir
      case "hidden":
        return (Number(a.hidden) - Number(b.hidden)) * dir
      default:
        return (a.index - b.index) * dir
    }
  })

  return (
    <Modal isOpen onOpenChange={onCancel} size="3xl">
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>
          {hasDiscrepancy && (
            <Alert title="The file has significant changes" color="warning">
              Please select a sheet tab to continue.
            </Alert>
          )}
          <Table
            aria-label="Sheet tab selection"
            sortDescriptor={sort}
            onSortChange={setSort}
            selectionMode="single"
            isStriped={true}
            selectedKeys={selected !== null ? new Set([selected]) : new Set()}
            onSelectionChange={(keys) => {
              const first = Array.from(keys)[0]
              setSelected(String(first))
            }}
          >
            <TableHeader>
              <TableColumn key="id" allowsSorting>ID</TableColumn>
              <TableColumn key="title" allowsSorting>Title</TableColumn>
              <TableColumn key="rowCount" allowsSorting>Rows</TableColumn>
              <TableColumn key="columnCount" allowsSorting>Cols</TableColumn>
              <TableColumn key="hidden" allowsSorting>Visible</TableColumn>
            </TableHeader>
            <TableBody items={sortedSheets} key="id">
              {(sheet) => (
                <TableRow>
                  <TableCell>{sheet.id}</TableCell>
                  <TableCell>{sheet.title}</TableCell>
                  <TableCell>{sheet.rowCount}</TableCell>
                  <TableCell>{sheet.columnCount}</TableCell>
                  <TableCell>
                    {sheet.hidden ? <EyeSlashIcon className="w-4 h-4 text-gray-500" /> : <EyeIcon className="w-4 h-4 text-green-600" />}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onPress={onCancel}>Cancel</Button>
          <Button
            color="primary"
            isDisabled={selected === null}
            onPress={() => {
              const picked = sheets.find((s) => s.id === selected)
              if (picked) onSelect(picked)
            }}
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export const SheetSelector = {
  async open(sheets: SheetTab[], title: string, hasDiscrepancy: boolean = false): Promise<SheetTab | null> {
    return new Promise((resolve) => {
      const container = document.createElement("div")
      document.body.appendChild(container)

      const root = createRoot(container)

      const cleanup = () => {
        root.unmount()
        container.remove()
      }

      const handleSelect = (sheet: SheetTab) => {
        resolve(sheet)
        cleanup()
      }

      const handleCancel = () => {
        resolve(null)
        cleanup()
      }

      root.render(
        <SheetSelectorModal
          sheets={sheets}
          title={title}
          hasDiscrepancy={hasDiscrepancy}
          onSelect={handleSelect}
          onCancel={handleCancel}
        />
      )
    })
  }
}

export default SheetSelector
