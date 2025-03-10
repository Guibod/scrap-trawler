import React, { createContext, useContext, useEffect, useState } from "react"
import { useEvent } from "~/resources/ui/providers/event"
import { SpreadsheetParserFactory } from "~/resources/domain/parsers/spreadsheet.parser.factory"
import type {
  SpreadsheetColumnMetaData,
  SpreadsheetFilter,
  SpreadsheetMetadata,
  SpreadsheetRawData,
  SpreadsheetRowId
} from "~/resources/domain/dbos/spreadsheet.dbo"
import { COLUMN_TYPE, COLUMN_TYPE_UNIQUE, DUPLICATE_STRATEGY } from "~/resources/domain/enums/spreadsheet.dbo"
import { addToast, Spinner } from "@heroui/react"
import { SetupStatus } from "~/resources/ui/components/event/setup/status"
import { CheckIcon } from "@heroicons/react/24/solid"
import type { EventModel } from "~/resources/domain/models/event.model"
import type { WotcId } from "~/resources/domain/dbos/identifiers.dbo"
import type { MappingDbo } from "~/resources/domain/dbos/mapping.dbo"

class EventSetupContextType {
  event: EventModel | null;
  spreadsheetMeta: SpreadsheetMetadata;
  spreadsheetData: SpreadsheetRawData | null;
  handleColumnMapping: (column: SpreadsheetColumnMetaData) => void;
  handleFileUpload: (file: File, autodetect: boolean) => void;
  handleStrategy: (strategy: DUPLICATE_STRATEGY) => void;
  handleFilters: (filters: SpreadsheetFilter[]) => void;
  handlePairings: (updatedPairings: MappingDbo | null) => void;
  handleFinalization: () => void;
  status: SetupStatus | null;
}

const EventSetupContext = createContext<EventSetupContextType>(null);

export const useEventSetup = () => {
  const context = useContext(EventSetupContext);
  if (!context) {
    throw new Error("useEventSetup must be used within EventSetupProvider");
  }
  return context;
};

export const EventSetupProvider = ({ children }) => {
  const { event, updateEvent } = useEvent();

  const [spreadsheetData, setSpreadsheetData] = useState<SpreadsheetRawData | null>(
    event.raw_data.spreadsheet || null
  );
  const [spreadsheetMeta, setSpreadsheetMeta] = useState<SpreadsheetMetadata>(
    event.spreadsheet?.meta || {
      source: "",
      tabName: null,
      columns: [],
      filters: [],
      duplicateStrategy: DUPLICATE_STRATEGY.NONE,
      finalized: false
    }
  );
  const [spreadsheetMapping, setSpreadsheetMapping] = useState<MappingDbo>(event.mapping || {});
  const [status, setStatus] = useState<SetupStatus | null>(null)

  useEffect(() => {
    updateStatus()

    async function updateStatus() {
      setStatus(await SetupStatus.create(spreadsheetMeta, spreadsheetData, spreadsheetMapping))
    }
  }, [spreadsheetMeta, spreadsheetData, spreadsheetMapping])


  const handleStrategy = (strategy: DUPLICATE_STRATEGY) => {
    setSpreadsheetMeta((prev) => {
      const updatedMeta = { ...prev, duplicateStrategy: strategy };
      updateEvent({ spreadsheet: { ...event.spreadsheet, meta: updatedMeta } });
      return updatedMeta;
    });
  }

  const handleFilters = (filters: SpreadsheetFilter[]) => {
    setSpreadsheetMeta((prev) => {
      const updatedMeta = { ...prev, filters };
      updateEvent({ spreadsheet: { ...event.spreadsheet, meta: updatedMeta } });
      return updatedMeta;
    });
  }

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

  const handlePairings = (updatedMapping: MappingDbo | null) => {
    setSpreadsheetMapping(updatedMapping)

    updateEvent({
      mapping: updatedMapping ?? {}, // Reset pairings if null
    });
  };

  const handleFinalization = () => {
    if (status.pairs === null || Object.keys(status.pairs).length === 0 || status.meta.columns.length === 0) {
      addToast({
        title: "Finalization Error",
        description: "Please ensure all columns are mapped and no pairings are present.",
        color: "danger",
        timeout: 3000,
      });
      return;
    }

    updateEvent({
      spreadsheet: { ...event.spreadsheet, meta: { ...spreadsheetMeta, finalized: true } },
    })

    addToast({
      title: "Finalization Success",
      description: "The event setup has been completed.",
      color: "success",
      timeout: 300
    })
  }

  const handleFileUpload = (file: File, autodetect: boolean) => {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (evt) => {
      if (!evt.target?.result) return;

      setSpreadsheetMeta((prev) => {
        const updatedMeta = { ...prev, source: file.name };
        console.log(updatedMeta); // Ensure it logs the updated meta before parsing
        return updatedMeta;
      });

      try {
        const updatedMeta = {
          ...spreadsheetMeta, // This might still be outdated if used directly
          source: file.name,
        };

        console.log("Using updated spreadsheetMeta:", updatedMeta);

        const parser = SpreadsheetParserFactory.create(updatedMeta, event.players, autodetect);
        const { columns, rows } = await parser.parse(evt.target.result);

        await updateEvent({
          spreadsheet: { ...event.spreadsheet, meta: { ...updatedMeta, columns } },
          raw_data: { ...event.raw_data, spreadsheet: rows },
        }).then(() =>
          addToast({
            title: "File Uploaded",
            icon: <CheckIcon className="fill-green-400 border-green-800" />,
            description: `The file ${file.name} was successfully uploaded.`,
            severity: "success",
            timeout: 3000,
          })
        ).then(() => {
          setSpreadsheetMeta((prev) => ({ ...prev, columns }));
          setSpreadsheetData(rows);
        })
      } catch (error) {
        console.error("Error processing file:", error);
        addToast({
          title: "File Upload Error",
          description: `An error occurred while processing the file ${file.name}.`,
          severity: "danger",
          timeout: 3000,
        });
      }
    };

    if (file.name.endsWith(".csv")) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  if (!status) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <Spinner size="lg" color="primary" label="Please wait while recovering the data"  />
      </div>
    )
  }

  return (
    <EventSetupContext.Provider
      value={{
        event,
        spreadsheetMeta,
        spreadsheetData,
        handleColumnMapping,
        handleFileUpload,
        handleStrategy,
        handleFilters,
        handlePairings,
        handleFinalization,
        status
      }}
    >
      {children}
    </EventSetupContext.Provider>
  );
};
