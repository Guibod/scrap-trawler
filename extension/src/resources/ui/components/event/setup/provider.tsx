import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback
} from "react"
import { useEvent } from "~/resources/ui/providers/event"
import type {
  SpreadsheetColumnMetaData,
  SpreadsheetFilter,
  SpreadsheetMetadata,
  SpreadsheetRawData,
} from "~/resources/domain/dbos/spreadsheet.dbo"
import { COLUMN_TYPE, COLUMN_TYPE_UNIQUE, DUPLICATE_STRATEGY } from "~/resources/domain/enums/spreadsheet.dbo"
import { addToast, Spinner } from "@heroui/react"
import { SetupStatus } from "~/resources/ui/components/event/setup/status"
import { CheckIcon } from "@heroicons/react/24/solid"
import type { EventModel } from "~/resources/domain/models/event.model"
import type { MappingDbo } from "~/resources/domain/dbos/mapping.dbo"
import { useFetchService } from "~/resources/ui/providers/fetcher"
import type { MTG_FORMATS } from "~/resources/domain/enums/mtg/formats.dbo"
import { ImporterFactory } from "~/resources/domain/parsers/importers/importer.factory"
import type { ImportedData } from "~/resources/domain/parsers/importers/importer"

export interface EventSetupContextType {
  event: EventModel | null;
  spreadsheetMeta: SpreadsheetMetadata;
  spreadsheetData: SpreadsheetRawData | null;
  handleColumnMapping: (column: SpreadsheetColumnMetaData) => void;
  handleSpreadsheetImport: (source, autodetect: boolean) => Promise<void>;
  handleStrategy: (strategy: DUPLICATE_STRATEGY) => void;
  handleFormat: (format: MTG_FORMATS) => void;
  handleFilters: (filters: SpreadsheetFilter[]) => void;
  handlePairings: (updatedPairings: MappingDbo | null) => void;
  handleFinalization: () => void;
  status: SetupStatus | null;
}

const EMPTY_SPREADSHEET_META: SpreadsheetMetadata = {
  source: "",
  sourceType: null,
  tabName: null,
  columns: [],
  filters: [],
  format: null,
  duplicateStrategy: DUPLICATE_STRATEGY.NONE,
  finalized: false
};

const EventSetupContext = createContext<EventSetupContextType>(null);

export const useEventSetup = () => {
  const context = useContext(EventSetupContext);
  if (!context) {
    throw new Error("useEventSetup must be used within EventSetupProvider");
  }
  return context;
};

export const EventSetupProvider = ({ children, onQuitHandler }: { children: React.ReactNode, onQuitHandler: () => Promise<void> }) => {
  const { event, updateEvent } = useEvent();
  const { fetchEvent } = useFetchService();

  const [spreadsheetData, setSpreadsheetData] = useState<SpreadsheetRawData | null>(event.raw_data.spreadsheet || null);
  const [spreadsheetMeta, setSpreadsheetMeta] = useState<SpreadsheetMetadata>(event.spreadsheet?.meta || EMPTY_SPREADSHEET_META);
  const [spreadsheetMapping, setSpreadsheetMapping] = useState<MappingDbo>(event.mapping || {});
  const [status, setStatus] = useState<SetupStatus | null>(null);

  const updateStatus = useCallback(async () => {
    const playerCount = Object.keys(event.players).length;
    const newStatus = await SetupStatus.create(spreadsheetMeta, spreadsheetData, spreadsheetMapping, playerCount);
    setStatus(newStatus);
  }, [event.players, spreadsheetMeta, spreadsheetData, spreadsheetMapping]);

  useEffect(() => {
    updateStatus();
  }, [updateStatus]);

  const handleStrategy = useCallback((strategy: DUPLICATE_STRATEGY) => {
    setSpreadsheetMeta(prev => {
      const updatedMeta = { ...prev, duplicateStrategy: strategy };
      updateEvent({ spreadsheet: { ...event.spreadsheet, meta: updatedMeta } });
      return updatedMeta;
    });
  }, [event, updateEvent]);

  const handleFormat = useCallback((format: MTG_FORMATS) => {
    setSpreadsheetMeta(prev => {
      const updatedMeta = { ...prev, format };
      updateEvent({ spreadsheet: { ...event.spreadsheet, meta: updatedMeta } });
      return updatedMeta;
    });
  }, [event, updateEvent]);

  const handleFilters = useCallback((filters: SpreadsheetFilter[]) => {
    setSpreadsheetMeta(prev => {
      const updatedMeta = { ...prev, filters };
      updateEvent({ spreadsheet: { ...event.spreadsheet, meta: updatedMeta } });
      return updatedMeta;
    });
  }, [event, updateEvent]);

  const handleColumnMapping = useCallback((column: SpreadsheetColumnMetaData) => {
    setSpreadsheetMeta(prev => {
      const updatedColumns = prev.columns.map(col => {
        if (COLUMN_TYPE_UNIQUE.includes(column.type) && col.type === column.type && col.index !== column.index) {
          addToast({
            title: "Column Type Reassigned",
            description: `${column.type} was already assigned. The previous column was reset.`,
            severity: "warning",
            timeout: 3000
          });
          return { ...col, type: COLUMN_TYPE.IGNORED_DATA };
        }
        return col;
      });

      updatedColumns[column.index] = column;
      const updatedMeta = { ...prev, columns: updatedColumns };
      updateEvent({ spreadsheet: { ...event.spreadsheet, meta: updatedMeta } });
      return updatedMeta;
    });
  }, [event, updateEvent]);

  const handlePairings = useCallback((updatedMapping: MappingDbo | null) => {
    setSpreadsheetMapping(updatedMapping);
    updateEvent({ mapping: updatedMapping ?? {} })
  }, [updateEvent]);

  const handleFinalization = useCallback(() => {
    if (status?.pairs === null || Object.keys(status.pairs).length === 0 || status.meta.columns.length === 0) {
      addToast({
        title: "Finalization Error",
        description: "Please ensure all columns are mapped and no pairings are present.",
        color: "danger",
        timeout: 3000
      });
      return;
    }

    updateEvent({ spreadsheet: { ...event.spreadsheet, meta: { ...spreadsheetMeta, finalized: true } } })
      .then(() => fetchEvent(event.id))
      .then(() => addToast({
        title: "Setup Completed",
        description: "The event setup has been completed.",
        color: "success"
      }))
      .then(() => onQuitHandler());
  }, [event, fetchEvent, onQuitHandler, spreadsheetMeta, status, updateEvent]);

  const handleSpreadsheetImport = useCallback(async (
    source: File | string,
    autodetect = true
  ) => {
    const meta: SpreadsheetMetadata = {
      ...spreadsheetMeta,
      source: typeof source === "string" ? source : source.name,
      sourceType: typeof source === "string" ? "url" : "file"
    }

    const parser = ImporterFactory.getImporterFor(meta)

    if (autodetect) {
      parser.enableAutoDetectColumns?.(event)
    }

    let result: ImportedData

    try {
      if (typeof source === "string") {
        result = await parser.parse(source)
      } else {
        const reader = new FileReader()
        result = await new Promise((resolve, reject) => {
          reader.onload = async (evt) => {
            if (!evt.target?.result) return reject("No data loaded")
            resolve(await parser.parse(evt.target.result))
          }
          if (source.name.endsWith(".csv")) {
            reader.readAsText(source)
          } else {
            reader.readAsArrayBuffer(source)
          }
        })
      }

      const { columns, rows } = result

      await updateEvent({
        spreadsheet: { ...event.spreadsheet, meta: { ...meta, columns } },
        raw_data: { ...event.raw_data, spreadsheet: rows }
      })

      setSpreadsheetMeta(prev => ({ ...prev, columns }))
      setSpreadsheetData(rows)

      addToast({
        title: "Spreadsheet Imported",
        icon: <CheckIcon className="fill-green-400 border-green-800" />,
        description: `Successfully loaded spreadsheet.`,
        severity: "success",
        timeout: 3000
      })
    } catch (error) {
      console.error("Spreadsheet import error:", error)
      addToast({
        title: "Import Failed",
        description: `Failed to load spreadsheet.`,
        severity: "danger",
        timeout: 3000
      })
    }
  }, [event, spreadsheetMeta, updateEvent])

  if (!status) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <Spinner size="lg" color="primary" label="Please wait while recovering the data" />
      </div>
    );
  }

  return (
    <EventSetupContext.Provider
      value={{
        event,
        spreadsheetMeta,
        spreadsheetData,
        handleColumnMapping,
        handleSpreadsheetImport,
        handleStrategy,
        handleFormat,
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