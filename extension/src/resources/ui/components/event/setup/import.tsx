import React, { useState } from "react"
import { useEventSetup } from "~/resources/ui/components/event/setup/provider"
import { Form } from "@heroui/react"
import { cn } from "@heroui/theme"
import { Input } from "@heroui/input"
import { Button } from "@heroui/button"
import DriveSpreadsheetPickerButton from "~/resources/ui/components/google-drive/button"
type SpreadsheetImportFormProps = {
  className?: string
}

export const SpreadsheetImportForm: React.FC<SpreadsheetImportFormProps> = ({ className }) => {
  const { spreadsheetMeta, handleImport } = useEventSetup()

  const [importing, setImporting] = useState(false)
  const [errors, setErrors] = useState({})

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setImporting(true)
    setErrors({})

    try {
      const fileInput = (e.currentTarget.elements.namedItem("file") as HTMLInputElement)
      const file = fileInput?.files?.[0]
      if (!file || file.size === 0) {
        setErrors({ file: "Please select a spreadsheet file to upload" })
        return
      }

      console.log("Importing file:", spreadsheetMeta.autodetect)
      await handleImport({
        metadata: {
          autodetect: spreadsheetMeta.autodetect
        },
        file,
      })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className={cn("flex gap-4 flex-col", className)}>
      <DriveSpreadsheetPickerButton
        color="primary"
        metadata={{ ...spreadsheetMeta, autodetect: spreadsheetMeta.autodetect }}
      />

      <div className="w-full text-center text-medium font-semibold">- OR -</div>

      <Form
        aria-label="spreadsheet-import-form"
        validationErrors={errors}
        onSubmit={onSubmit}
      >
        <Input
          key="file-input"
          aria-label="file-upload"
          name="file"
          isRequired
          type="file"
          label="Spreadsheet file"
        />

        <Button type="submit" color="secondary" className="mt-4 w-full" isLoading={importing} isDisabled={importing}>
          Import once from a spreadsheet
        </Button>
      </Form>
    </div>
  )
}
