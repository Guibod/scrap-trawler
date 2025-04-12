import { Card, CardBody } from "@heroui/card"
import { useEventSetup } from "~/resources/ui/components/event/setup/provider"
import React, { useState } from "react"
import { Select, SelectItem } from "@heroui/react"
import { Alert } from "@heroui/alert"
import type { UseCardProps } from "@heroui/card/dist/use-card"
import { MTG_FORMATS } from "~/resources/domain/enums/mtg/formats.dbo"
import { capitalize } from "~/resources/utils/text"
import { SpreadsheetImportForm } from "~/resources/ui/components/event/setup/import"

interface SetupUploadProps extends UseCardProps {}
const OTHER = 'other'
const SetupUpload = ({...props}: SetupUploadProps) => {
  const { event, handleFormat, status } = useEventSetup();
  const [format, setFormat] = useState(event.spreadsheet?.meta?.format ?? event.format ?? OTHER);
  const formatOptions: {key: string, label: string}[] = Object.entries(MTG_FORMATS).map(([key, value]) => ({
    key: value,
    label: capitalize(key),
  }))
  formatOptions.push({key: OTHER, label: "Other"})

  return (
    <Card {...props}>
      <CardBody>
        {status.hasData && (
          <Alert className="mb-1" title="The spreadsheet was recovered successfully" color={"success"}>
          </Alert>
        )}

        <div className="w-10/12 gap-5 mx-auto">
          <h3 className="text-medium mt-3">Event Setup Guide</h3>
          <p className="text-medium mt-1">Welcome to the Scrap-Trawler Setup Wizard! This process will help you prepare your tournament data by importing player lists, decklists, and other necessary information. Follow the steps to upload your spreadsheet, map columns, handle duplicates, and finalize the setup before proceeding to pair players with their decklists.</p>
        </div>

        <div className="grid-cols-2 grid w-10/12 gap-5 mx-auto mt-4">
          <div>
            <h3 className="text-medium mt-3">Tournament format</h3>
            <p>
              Scrap trawler support a curated list of formats. If your format is not present use the "Other" option.
            </p>
          </div>

          <Select className="mt-2" aria-label="event-format-selector" label="Format" items={formatOptions} defaultSelectedKeys={[format]} onSelectionChange={(keys) => {
            let selected: MTG_FORMATS = null
            if (keys.currentKey !== OTHER) {
              selected = keys.currentKey as MTG_FORMATS
            }
            setFormat(selected)
            handleFormat(selected)
          }}>
            {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
          </Select>
        </div>

        <div className="grid-cols-2 grid w-10/12 gap-5 mx-auto mt-4">
          <div>
            <h3 className="text-medium mt-3">Accepted File Formats</h3>
            <p className="mt-1">Scrap-Trawler supports the following file formats for spreadsheet uploads:</p>

            <ul className={"list-disc list-inside mt-1"}>
              <li>CSV (.csv) – Comma-separated values, ideal for simple structured data.</li>
              <li>Excel (.xlsx, .xls) – Standard spreadsheet formats used in Microsoft Excel and Google Sheets.</li>
            </ul>

            <p className="mt-1">Make sure your file contains clearly labeled columns for player names, decklists, and any other required data. The system will guide you through mapping your columns to ensure proper integration.</p>
          </div>

          <SpreadsheetImportForm className="w-full" />
        </div>
      </CardBody>
    </Card>
  );
};

export default SetupUpload;
