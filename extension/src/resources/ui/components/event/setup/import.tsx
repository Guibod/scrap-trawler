import { GoogleSheetsService } from "~/resources/integrations/google-doc/spreadsheet.service"
import React, { useState } from "react"
import { useEventSetup } from "~/resources/ui/components/event/setup/provider"
import { Checkbox, Form } from "@heroui/react"
import { cn } from "@heroui/theme"
import { Switch } from "@heroui/switch"
import { Input } from "@heroui/input"
import { Button } from "@heroui/button"
import { isValidHttpUrl } from "~/resources/utils/text"

type SpreadsheetImportFormProps = {
  className?: string
}

export const SpreadsheetImportForm: React.FC<SpreadsheetImportFormProps> = ({ className }) => {
  const { spreadsheetMeta, handleImport } = useEventSetup()
  const [useUrl, setUseUrl] = useState(!(spreadsheetMeta.source && !isValidHttpUrl(spreadsheetMeta.source)))
  const [importing, setImporting] = useState(false)
  const [sheetUrl, setSheetUrl] = useState(spreadsheetMeta.source)
  const [errors, setErrors] = useState({})

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setImporting(true)
    const data = Object.fromEntries(new FormData(e.currentTarget))
    setErrors({}) // reset

    try {
      if (useUrl) {
        if (!sheetUrl.trim()) {
          setErrors({ url: "Please enter a Google Sheets URL" })
          return
        }
        if (!GoogleSheetsService.isSpreadsheetUrl(sheetUrl)) {
          setErrors({ url: "This doesn't look like a valid Google Sheets link" })
          return
        }
        await handleImport({
          metadata: {
            source: sheetUrl,
            sourceType: "url",
            autodetect: !!data.autodetect,
          },
        })
      } else {
        const fileInput = (e.currentTarget.elements.namedItem("file") as HTMLInputElement)
        const file = fileInput?.files?.[0]
        if (!file || file.size === 0) {
          setErrors({ file: "Please select a spreadsheet file to upload" })
          return
        }
        await handleImport({
          metadata: {
            source: file.name,
            sourceType: "file",
            autodetect: !!data.autodetect,
          },
          file
        })
      }
    } finally {
      setImporting(false)
    }
  }

  return (
    <Form
      className={cn("flex gap-4 flex-col", className)}
      aria-label="spreadsheet-import-form"
      validationErrors={errors}
      onSubmit={onSubmit}
    >
      <Switch isSelected={useUrl} onValueChange={setUseUrl}>
        Import from Google Sheets URL
      </Switch>

      {useUrl ? (
        <Input
          key="url-input"
          aria-label="sheet-url"
          name="url"
          isRequired
          type="url"
          label="Google Sheets URL"
          placeholder="https://docs.google.com/spreadsheets/..."
          defaultValue={spreadsheetMeta.sourceType === "url" ? spreadsheetMeta.source : ""}
          value={sheetUrl}
          onChange={(e) => setSheetUrl(e.target.value)}
        />
      ) : (
        <Input
          key="file-input"
          aria-label="file-upload"
          name="file"
          defaultValue={spreadsheetMeta.sourceType === "file" ? spreadsheetMeta.source : ""}
          isRequired
          type="file"
          label="Spreadsheet file"
        />
      )}

      <Checkbox
        aria-label="auto-detect"
        name="autodetect"
        size="sm"
        value="1"
        defaultSelected
      >
        Auto-detect columns
      </Checkbox>

      <Button type="submit" color="primary" className="mt-4 w-full" isLoading={importing} isDisabled={importing} >
        Import Spreadsheet
      </Button>
    </Form>
  )
}
