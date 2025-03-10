import React, { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/table";
import { getKeyValue, Pagination } from "@heroui/react"
import type { TableProps } from "@heroui/table/dist/table";
import SpreadsheetColumn from "~/resources/ui/components/event/setup/mapping/column"
import { COLUMN_TYPE_META } from "~/resources/domain/enums/spreadsheet.dbo"
import { useEventSetup } from "~/resources/ui/components/event/setup/provider"

const ROWS_PER_PAGE = 10;

const MappingTable: React.FC<TableProps> = ({ ...props }) => {
  const { spreadsheetMeta, spreadsheetData, handleColumnMapping } = useEventSetup()
  const [sortedColumns, setSortedColumns] = useState([...spreadsheetMeta.columns]);

  if (!spreadsheetData) return;

  useEffect(() => {
    setSortedColumns([...spreadsheetMeta.columns].sort((a, b) => a.index - b.index));
  }, [spreadsheetMeta.columns]);

  const [page, setPage] = React.useState(1);

  const pages = Math.ceil(spreadsheetData.length / ROWS_PER_PAGE);

  const items: {key: string, [key: string]: string}[] = React.useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    const end = start + ROWS_PER_PAGE;

    return spreadsheetData.slice(start, end).map((row: string[], rowIndex: number) => {
      const rowObject: Record<number | string, string | null> = { key: `${rowIndex}` };

      sortedColumns.forEach(({ index }) => {
        rowObject[index] = row[index] ?? "";
      });

      return rowObject;
    });
  }, [page, spreadsheetData, sortedColumns]);

  return (
    <Table
      isStriped={true}
      isHeaderSticky={true}
      className="container mx-auto" {...props}
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
        {sortedColumns.map((column) => (
          <TableColumn key={column.index} className="max-w-[150px] truncate">
            <div className="flex items-center justify-between">
              <SpreadsheetColumn
                column={column}
                onUpdate={handleColumnMapping}
              />
            </div>
          </TableColumn>
          ))}
      </TableHeader>
      <TableBody items={items}>
        {(row) => (
          <TableRow key={row.key}>
            {sortedColumns.map((column) => (
              <TableCell
                key={column.index}
                className={"max-w-[150px] max-h-[50px] truncate " + COLUMN_TYPE_META[column.type].background}>
                  <span title={getKeyValue(row, column.index)} className="truncate block">
                      {getKeyValue(row, column.index)}
                  </span>
              </TableCell>
            ))}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default MappingTable;
