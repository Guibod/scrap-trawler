import React, {
  createContext, useContext, useEffect, useState, useCallback, useMemo
} from "react"
import { useEvent } from "~/resources/ui/providers/event"
import { useFetchService } from "~/resources/ui/providers/fetcher"
import { Spinner, addToast } from "@heroui/react"
import { CheckIcon } from "@heroicons/react/24/solid"
import { SetupStatus } from "~/resources/ui/components/event/setup/status"
import { COLUMN_TYPE, COLUMN_TYPE_UNIQUE, DUPLICATE_STRATEGY } from "~/resources/domain/enums/spreadsheet.dbo"
import { useDriveFileWatcher } from "~/resources/ui/components/google-drive/hook"
import { ImporterFactory } from "~/resources/domain/parsers/importers/factory"
import type { EventModel } from "~/resources/domain/models/event.model"
import type {
  SpreadsheetColumnMetaData, SpreadsheetFilter,
  SpreadsheetMetadata, SpreadsheetRawData
} from "~/resources/domain/dbos/spreadsheet.dbo"
import type { SpreadsheetImportRequest } from "~/resources/domain/parsers/importers/types"
import type { MTG_FORMATS } from "~/resources/domain/enums/mtg/formats.dbo"
import type { MappingDbo } from "~/resources/domain/dbos/mapping.dbo"
import type { Importer } from "~/resources/domain/parsers/importers/importer"
import { useNavigate } from "react-router-dom"


export interface EventSetupContextType {
  event: EventModel | null
  spreadsheetMeta: SpreadsheetMetadata
  spreadsheetData: SpreadsheetRawData | null
  handleColumnMapping: (column: SpreadsheetColumnMetaData) => void
  handleImport: (args: SpreadsheetImportRequest) => Promise<void>
  handleStrategy: (strategy: DUPLICATE_STRATEGY) => void
  handleFormat: (format: MTG_FORMATS) => void
  handleAutoDetect: (autodetect: boolean) => void
  handleFilters: (filters: SpreadsheetFilter[]) => void
  handlePairings: (updatedPairings: MappingDbo | null) => void
  handleFinalization: () => void
  status: SetupStatus | null
}

const EMPTY_SPREADSHEET_META: SpreadsheetMetadata = {
  source: "",
  sourceType: null,
  importedAt: null,
  name: null,
  autodetect: false,
  sheetName: null,
  sheetId: null,
  columns: [],
  filters: [],
  format: null,
  duplicateStrategy: DUPLICATE_STRATEGY.NONE,
  finalized: false
}

const EventSetupContext = createContext<EventSetupContextType>(null)

export const useEventSetup = () => {
  const context = useContext(EventSetupContext)
  if (!context) throw new Error("useEventSetup must be used within EventSetupProvider")
  return context
}

export const EventSetupProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const { event, updateEvent } = useEvent()
  const navigate = useNavigate()
  const { fetchEvent } = useFetchService()

  const [spreadsheetData, setSpreadsheetData] = useState(() => event.raw_data.spreadsheet || null)
  const [spreadsheetMeta, setSpreadsheetMeta] = useState(() => event.spreadsheet?.meta || EMPTY_SPREADSHEET_META)
  const [spreadsheetMapping, setSpreadsheetMapping] = useState(() => event.mapping || {})
  const [status, setStatus] = useState<SetupStatus | null>(null)

  const handleImport = useCallback(async (req: SpreadsheetImportRequest) => {
    let importer: Importer

    try {
      importer = ImporterFactory.create(req)
      await importer.prepare()
      const { columns, rows } = await importer.parse()
      console.log("Parsed spreadsheet data:", { columns, rows })
      await updateEvent({
        spreadsheet: {
          ...event.spreadsheet,
          meta: { ...importer.metadata, columns, importedAt: new Date() }
        },
        raw_data: { ...event.raw_data, spreadsheet: rows }
      })

      setSpreadsheetMeta((prev) => ({ ...prev, columns }))
      setSpreadsheetData(rows)

      addToast({
        title: "Spreadsheet Imported",
        icon: <CheckIcon className="fill-green-400 border-green-800" />,
        description: "Successfully loaded spreadsheet.",
        severity: "success"
      })
    } catch (err) {
      console.error("Spreadsheet import error:", err)
      addToast({
        title: "Import Failed",
        description: err instanceof Error ? err.message : "Unknown error",
        severity: "danger"
      })
    }
  }, [event.spreadsheet, event.raw_data, updateEvent])

  useDriveFileWatcher(
    event.spreadsheet.meta?.sourceType === "drive" ? event.spreadsheet.meta.source : null,
    event.spreadsheet.meta?.importedAt,
    () => handleImport({ metadata: spreadsheetMeta, event })
  )

  const updateStatus = useCallback(async () => {
    const playerCount = Object.keys(event.players).length
    const newStatus = await SetupStatus.create(spreadsheetMeta, spreadsheetData, spreadsheetMapping, playerCount)
    setStatus(newStatus)
  }, [event.players, spreadsheetMeta, spreadsheetData, spreadsheetMapping])

  useEffect(() => {
    updateStatus()
  }, [updateStatus])

  const handleStrategy = useCallback((strategy: DUPLICATE_STRATEGY) => {
    setSpreadsheetMeta((prev) => {
      const updatedMeta = { ...prev, duplicateStrategy: strategy }
      updateEvent({ spreadsheet: { ...event.spreadsheet, meta: updatedMeta } })
      return updatedMeta
    })
  }, [event.spreadsheet, updateEvent])

  const handleFormat = useCallback((format: MTG_FORMATS) => {
    setSpreadsheetMeta((prev) => {
      const updatedMeta = { ...prev, format }
      updateEvent({ spreadsheet: { ...event.spreadsheet, meta: updatedMeta } })
      return updatedMeta
    })
  }, [event.spreadsheet, updateEvent])

  const handleAutoDetect = useCallback((autodetect: boolean) => {
    setSpreadsheetMeta((prev) => {
      const updatedMeta = { ...prev, autodetect }
      updateEvent({ spreadsheet: { ...event.spreadsheet, meta: updatedMeta } })
      return updatedMeta
    })
  }, [event.spreadsheet, updateEvent])

  const handleFilters = useCallback((filters: SpreadsheetFilter[]) => {
    setSpreadsheetMeta((prev) => {
      const updatedMeta = { ...prev, filters }
      updateEvent({ spreadsheet: { ...event.spreadsheet, meta: updatedMeta } })
      return updatedMeta
    })
  }, [event.spreadsheet, updateEvent])

  const handleColumnMapping = useCallback((column: SpreadsheetColumnMetaData) => {
    setSpreadsheetMeta((prev) => {
      const updatedColumns = prev.columns.map((col) => {
        if (COLUMN_TYPE_UNIQUE.includes(column.type) && col.type === column.type && col.index !== column.index) {
          addToast({
            title: "Column Type Reassigned",
            description: `${column.type} was already assigned. The previous column was reset.`,
            severity: "warning"
          })
          return { ...col, type: COLUMN_TYPE.IGNORED_DATA }
        }
        return col
      })

      updatedColumns[column.index] = column
      const updatedMeta = { ...prev, columns: updatedColumns }
      updateEvent({ spreadsheet: { ...event.spreadsheet, meta: updatedMeta } })
      return updatedMeta
    })
  }, [event.spreadsheet, updateEvent])

  const handlePairings = useCallback((mapping: MappingDbo | null) => {
    setSpreadsheetMapping(mapping)
    updateEvent({ mapping: mapping ?? {} })
  }, [updateEvent])

  const handleFinalization = useCallback(() => {
    if (status?.pairs === null || Object.keys(status.pairs).length === 0 || status.meta.columns.length === 0) {
      addToast({
        title: "Finalization Error",
        description: "Please ensure all columns are mapped and no pairings are present.",
        color: "danger"
      })
      return
    }

    updateEvent({ spreadsheet: { ...event.spreadsheet, meta: { ...spreadsheetMeta, finalized: true } } })
      .then(() => fetchEvent(event.id))
      .then(() => addToast({
        title: "Setup Completed",
        description: "The event setup has been completed.",
        color: "success"
      }))
      .then(() => navigate(`/events/${event.id}`))
  }, [status, spreadsheetMeta, updateEvent, event.spreadsheet, event.id, fetchEvent])

  const contextValue = useMemo(() => ({
    event,
    spreadsheetMeta,
    spreadsheetData,
    handleColumnMapping,
    handleAutoDetect,
    handleImport,
    handleStrategy,
    handleFormat,
    handleFilters,
    handlePairings,
    handleFinalization,
    status
  }), [
    event,
    spreadsheetMeta,
    spreadsheetData,
    handleColumnMapping,
    handleAutoDetect,
    handleImport,
    handleStrategy,
    handleFormat,
    handleFilters,
    handlePairings,
    handleFinalization,
    status
  ])

  if (!status) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <Spinner size="lg" color="primary" label="Please wait while recovering the data" />
      </div>
    )
  }

  return (
    <EventSetupContext.Provider value={contextValue}>
      {children}
    </EventSetupContext.Provider>
  )
}
