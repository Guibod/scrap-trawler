import { CalendarClock, FileSpreadsheet, RefreshCcw, Sheet, Cog } from "lucide-react"
import React from "react"
import type { SpreadsheetMetadata } from "~/resources/domain/dbos/spreadsheet.dbo"
import { Link } from "@heroui/link"

type ImportSummaryProps = {
  meta: SpreadsheetMetadata,
  onEdit?: () => void,
}
const ImportSummary: React.FC<ImportSummaryProps> = ({meta, onEdit}) => {
  return (
    <div className="rounded border p-3 text-sm space-y-2 bg-muted/50">
      <div className="flex items-center gap-2">
        <FileSpreadsheet className="w-4 h-4 text-muted-foreground" />
        <span className="font-medium">{meta.name ?? meta.source}</span>
      </div>

      {meta.sheetName && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Sheet className="w-4 h-4" />
          <span>
            Sheet: <code>{meta.sheetName}</code> ({meta.sheetId ?? "?"})
          </span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Cog className="w-4 h-4 text-muted-foreground" />
        <span className="font-medium">{meta.autodetect ? "Autodetect column" : "No auto-detect"}</span>
      </div>

      {meta.importedAt && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <CalendarClock className="w-4 h-4" />
          <span>
            Imported at: {new Date(meta.importedAt).toLocaleString()}
          </span>
        </div>
      )}

      {meta.sourceType === "drive" && (
        <div className="flex items-center gap-2 text-muted-foreground">
        <RefreshCcw className="w-4 h-4" />
        <span>This file is auto-checked every 5 minutes for updates.</span>
        </div>
      )}

      {onEdit &&
        <Link onPress={onEdit} className="text-xs text-blue-600 hover:underline cursor-pointer">
          Edit
        </Link>
      }
    </div>
  );
}

export default ImportSummary