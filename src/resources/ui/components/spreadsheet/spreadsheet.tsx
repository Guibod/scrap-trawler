import React from "react";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/table";
import { getKeyValue } from "@heroui/react";
import type {
  RawSpreadsheetRow,
  SpreadsheetMetadata
} from "~resources/domain/dbos/spreadsheet.dbo"
import type { TableProps } from "@heroui/table/dist/table";
import SpreadsheetColumn from "~resources/ui/components/spreadsheet/column"

type SpreadsheetComponentProps = {
  meta: SpreadsheetMetadata;
  data: RawSpreadsheetRow[];
  onColumnMappingChange: (SpreadsheetColumnMetaData) => void;
} & TableProps;

const Spreadsheet: React.FC<SpreadsheetComponentProps> = ({ meta, data, onColumnMappingChange, ...props }) => {
  const sortedColumns = [...meta.columns].sort((a, b) => a.index - b.index);

  const processedData = data.map((row, rowIndex) => {
    const rowObject: Record<number | string, string | null> = { key: `${rowIndex}` };

    sortedColumns.forEach(({ index }) => {
      rowObject[index] = row[index] ?? "";
    });

    return rowObject;
  });


  return (
    <Table isStriped={true} isHeaderSticky={true} className="container mx-auto" isVirtualized={true} {...props}>
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
      <TableBody items={processedData}>
        {(row) => (
          <TableRow key={row.key}>
            {sortedColumns.map((column) => ( // ✅ Ensure consistent mapping
              <TableCell key={column.index}>{getKeyValue(row, column.index)}</TableCell>
            ))}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default Spreadsheet;
