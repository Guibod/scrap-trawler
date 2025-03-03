import React, { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/table";
import { getKeyValue, Pagination } from "@heroui/react"
import type {
  RawSpreadsheetRow,
  SpreadsheetMetadata
} from "~resources/domain/dbos/spreadsheet.dbo"
import type { TableProps } from "@heroui/table/dist/table";
import SpreadsheetColumn from "~resources/ui/components/spreadsheet/column"
import { COLUMN_TYPE } from "~resources/domain/enums/spreadsheet.dbo"

type SpreadsheetComponentProps = {
  meta: SpreadsheetMetadata;
  data: RawSpreadsheetRow[];
  onColumnMappingChange: (SpreadsheetColumnMetaData) => void;
} & TableProps;

const columnBackgroundColors: Record<COLUMN_TYPE, string> = {
  [COLUMN_TYPE.IGNORED_DATA]: "bg-gradient-to-r from-gray-200/40 via-gray-300/40 to-gray-200/40 bg-[length:10px_10px] bg-repeat",
  // Unique id is yellow
  [COLUMN_TYPE.UNIQUE_ID]: "bg-yellow-200/50",
  // Decklist are green
  [COLUMN_TYPE.DECKLIST_URL]: "bg-green-200/40",
  [COLUMN_TYPE.DECKLIST_TXT]: "bg-green-200/40",
  // Main data are red-ish
  [COLUMN_TYPE.ARCHETYPE]: "bg-red-200/40",
  [COLUMN_TYPE.FIRST_NAME]: "bg-orange-200/30",
  [COLUMN_TYPE.LAST_NAME]: "bg-amber-200/30",
  // Player data is pink
  [COLUMN_TYPE.PLAYER_DATA]: "bg-pink-200/30",
  // Filter is indigo
  [COLUMN_TYPE.FILTER]: "bg-indigo-200/30",
};

const ROWS_PER_PAGE = 10;

const SpreadsheetRaw: React.FC<SpreadsheetComponentProps> = ({ meta, data, onColumnMappingChange, ...props }) => {
  const [sortedColumns, setSortedColumns] = useState([...meta.columns]);

  useEffect(() => {
    setSortedColumns([...meta.columns].sort((a, b) => a.index - b.index));
  }, [meta.columns]);

  const [page, setPage] = React.useState(1);

  const pages = Math.ceil(data.length / ROWS_PER_PAGE);

  const items = React.useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    const end = start + ROWS_PER_PAGE;

    return data.slice(start, end).map((row, rowIndex) => {
      const rowObject: Record<number | string, string | null> = { key: `${rowIndex}` };

      sortedColumns.forEach(({ index }) => {
        rowObject[index] = row[index] ?? "";
      });

      return rowObject;
    });
  }, [page, data, sortedColumns]);

  return (
    <Table isStriped={true} isHeaderSticky={true} className="container mx-auto" {...props}
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
            <SpreadsheetColumn
              column={column}
              onUpdate={onColumnMappingChange}
            />
          </TableColumn>
        ))}
      </TableHeader>
      <TableBody items={items}>
        {(row) => (
          <TableRow key={row.key}>
            {sortedColumns.map((column) => (
              <TableCell
                key={column.index}
                className={"max-w-[150px] max-h-[50px] truncate " + columnBackgroundColors[column.type]}>
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

export default SpreadsheetRaw;
