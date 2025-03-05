import React, { useEffect, useMemo, useRef, useState } from "react"
import { Select, SelectItem } from "@heroui/select";
import { type Selection } from "@heroui/react";
import { Button } from "@heroui/button";
import { COLUMN_TYPE, FILTER_OPERATOR, FILTER_OPERATOR_META } from "~resources/domain/enums/spreadsheet.dbo"
import type { SpreadsheetColumnMetaData, SpreadsheetFilter } from "~resources/domain/dbos/spreadsheet.dbo"
import { useEventSetup } from "~resources/ui/components/event/setup/provider"

type FilterInputProps = {
  filter: SpreadsheetFilter;
  onChange: (updatedFilter: SpreadsheetFilter) => void;
  onRemove: () => void;
};

const operatorItems = Object.entries(FILTER_OPERATOR_META).map(([key, values]) => ({ key, ...values }))

const FilterInput: React.FC<FilterInputProps> = ({ filter, onChange, onRemove }) => {
  const { spreadsheetMeta, status } = useEventSetup();

  const [columns, setColumn] = useState<Selection>(filter.column !== null ? new Set([filter.column]): new Set());
  const [operators, setOperator] = useState<Selection>(new Set([filter.operator]));
  const [values, setValues] = useState<Selection>(new Set(filter.values));
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false; // Prevent first run
      return;
    }
    if (columns == 'all' || !columns.size) return;

    onChange({
      column: [...columns][0] as number,
      operator: [...operators][0] as FILTER_OPERATOR,
      values: [...values] as string[],
    })
  }, [columns, operators, values])

  const availableColumns: {key: string, label: string}[] = useMemo(() => {
    return spreadsheetMeta.columns
      .filter((col: SpreadsheetColumnMetaData) => col.type === COLUMN_TYPE.FILTER)
      .map((col: SpreadsheetColumnMetaData) => ({ key: col.index, label: col.name, index: col.index }));
  }, ['spreadsheetMeta.columns'])

  const availableValues: {key: string, label: string}[] = useMemo(() => {
    if (columns == 'all' || !columns.size) return [];
    const columnIndex = [...columns][0]
    const values = status.rawData?.map((row) => row[columnIndex]) ?? [];
    const uniques = new Set(values)
    return Array.from(uniques)
      .sort()
      .filter(value => !!value)
      .map((value) => ({ key: String(value), label: String(value) }));
  }, [columns, 'spreadsheetMeta.columns'])

  return (
    <div className="flex items-center gap-4 border p-4 rounded-lg shadow-sm">
      {/* Column Selector */}
      <Select
        aria-label="Select Column"
        items={availableColumns}
        selectedKeys={columns}
        onSelectionChange={setColumn}
        placeholder="Column"
        className="w-1/4"
      >
        {availableColumns.map((col) => (
          <SelectItem key={col.key}>{col.label}</SelectItem>
        ))}
      </Select>

      {/* Operator Selector */}
      <Select
        aria-label="Select Operator"
        onSelectionChange={setOperator}
        placeholder="Operator"
        className="w-1/4"
        items={operatorItems}
        selectedKeys={operators}
      >
        {(operator) => (
          <SelectItem key={operator.key}>{operator.label}</SelectItem>
        )}
      </Select>

      {/* Value Input */}
      <Select
        aria-label="Select Values"
        onSelectionChange={setValues}
        placeholder="Values"
        className="w-1/4"
        items={availableValues}
        selectedKeys={values}
        selectionMode="multiple"
      >
        {(value) => (
          <SelectItem key={value.key}>{value.label}</SelectItem>
        )}
      </Select>

      {/* Remove Button */}
      <Button onPress={onRemove} className="bg-red-500 text-white px-4 py-2 rounded">
        ✖
      </Button>
    </div>
  );
};

export default FilterInput;
