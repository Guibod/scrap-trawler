import React, { createContext, useContext, useState } from "react";
import { useEvent } from "~resources/ui/providers/event";
import { SpreadsheetParserFactory } from "~resources/domain/parsers/spreadsheet.parser.factory";
import type {
  RawSpreadsheetRow,
  SpreadsheetColumnMetaData,
  SpreadsheetMetadata
} from "~resources/domain/dbos/spreadsheet.dbo"
import { COLUMN_TYPE, COLUMN_TYPE_UNIQUE, DUPLICATE_HANDLING_STRATEGY } from "~resources/domain/enums/spreadsheet.dbo"
import { addToast } from "@heroui/react"
import { SETUP_STEPS } from "~resources/ui/components/event/setup/config"

const EventSetupContext = createContext(null);

export const useEventSetup = () => {
  const context = useContext(EventSetupContext);
  if (!context) {
    throw new Error("useEventSetup must be used within EventSetupProvider");
  }
  return context;
};

export const EventSetupProvider = ({ children }) => {
  const { event, updateEvent } = useEvent();

  const [spreadsheetData, setSpreadsheetData] = useState<RawSpreadsheetRow[] | null>(
    event.raw_data.spreadsheet || null
  );
  const [spreadsheetMeta, setSpreadsheetMeta] = useState<SpreadsheetMetadata>(
    event.spreadsheet?.meta || {
      source: "",
      tabName: null,
      columns: [],
      filters: [],
      duplicateStrategy: DUPLICATE_HANDLING_STRATEGY.KEEP_FIRST,
    }
  );

  // Compute first incomplete step
  const currentStepIndex = SETUP_STEPS.findIndex(({ isComplete }) => !isComplete(spreadsheetMeta, spreadsheetData));
  const currentStep = currentStepIndex !== -1 ? SETUP_STEPS[currentStepIndex] : SETUP_STEPS[0];

  // Compute progress percentage
  const progressPercentage = ((currentStepIndex + 1) / SETUP_STEPS.length) * 100;


  const handleColumnMapping = (column: SpreadsheetColumnMetaData) => {
    setSpreadsheetMeta((prev) => {
      const updatedColumns = prev.columns.map((col) => {
        // If another column already has the selected unique type, reset it
        if (COLUMN_TYPE_UNIQUE.includes(column.type) && col.type === column.type && col.index !== column.index) {
          addToast({
            title: "Column Type Reassigned",
            description: `${column.type} was already assigned. The previous column was reset.`,
            severity: "warning",
            timeout: 3000,
          });

          return { ...col, type: COLUMN_TYPE.IGNORED_DATA };
        }
        return col;
      });

      // Apply the new column mapping
      updatedColumns[column.index] = column;

      // Update state and event
      updateEvent({
        spreadsheet: {
          ...event.spreadsheet,
          meta: { ...event.spreadsheet.meta, columns: updatedColumns },
        },
      });

      return { ...prev, columns: updatedColumns };
    });
  };

  const handleFileUpload = (file) => {
    if (!file) return;
    setSpreadsheetMeta((prev) => ({ ...prev, source: file.name }));
    processFile(file);
  };

  const processFile = (file) => {
    const reader = new FileReader();
    reader.onload = async (evt) => {
      if (!evt.target?.result) return;
      const parser = SpreadsheetParserFactory.create(spreadsheetMeta, event.players);
      const { columns, rows } = await parser.parse(evt.target.result);
      setSpreadsheetMeta((prev) => ({ ...prev, columns }));
      setSpreadsheetData(rows);
      updateEvent({
        spreadsheet: { ...event.spreadsheet, meta: { ...spreadsheetMeta, columns } },
        raw_data: { ...event.raw_data, spreadsheet: rows },
      });
    };
    file.name.endsWith(".csv") ? reader.readAsText(file) : reader.readAsArrayBuffer(file);
  };

  return (
    <EventSetupContext.Provider
      value={{
        spreadsheetMeta,
        spreadsheetData,
        handleColumnMapping,
        handleFileUpload,
        currentStep,
        progressPercentage,
      }}
    >
      {children}
    </EventSetupContext.Provider>
  );
};
