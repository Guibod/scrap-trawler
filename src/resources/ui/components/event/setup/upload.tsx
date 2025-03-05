import { Card, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";
import { useEventSetup } from "~resources/ui/components/event/setup/provider"
import React from "react"
import { Checkbox, Form } from "@heroui/react"
import { Button } from "@heroui/button"
import { Alert } from "@heroui/alert"
import type { UseCardProps } from "@heroui/card/dist/use-card"

interface SetupUploadProps extends UseCardProps {}

const SetupUpload = ({...props}: SetupUploadProps) => {
  const { handleFileUpload, status } = useEventSetup();

  return (
    <Card {...props}>
      <CardBody>
        {status.hasData && (
          <Alert className="mb-1" title="The spreadsheet was recovered successfully" color={"success"}>
          </Alert>
        )}

        <div className="grid-cols-2 grid w-10/12 gap-5 mx-auto">
          <div>
            <h3 className="text-medium mt-3">Event Setup Guide</h3>
            <p className="mt-1">Welcome to the Scrap-Trawler Setup Wizard! This process will help you prepare your tournament data by importing player lists, decklists, and other necessary information. Follow the steps to upload your spreadsheet, map columns, handle duplicates, and finalize the setup before proceeding to pair players with their decklists.</p>
          </div>

          <div>
            <h3 className="text-medium mt-3">Accepted File Formats</h3>
            <p className="mt-1">Scrap-Trawler supports the following file formats for spreadsheet uploads:</p>

            <ul className={"list-disc list-inside mt-1"}>
              <li>CSV (.csv) – Comma-separated values, ideal for simple structured data.</li>
              <li>Excel (.xlsx, .xls) – Standard spreadsheet formats used in Microsoft Excel and Google Sheets.</li>
            </ul>

            <p className="mt-1">Make sure your file contains clearly labeled columns for player names, decklists, and any other required data. The system will guide you through mapping your columns to ensure proper integration.</p>
          </div>

          <Form className="col-span-2" onSubmit={(e) => {
            e.preventDefault();
            const d = Object.fromEntries(new FormData(e.currentTarget));
            handleFileUpload(d['file'], !!d['autodetect']);
          }}>
            <div className="flex gap-4 w-full">
              <Input name="file" isRequired type="file" className="w-1/2" />
              <Checkbox name="autodetect" size="sm" value="1" defaultSelected>Auto-detect columns on upload</Checkbox>
              <Button type="submit" color={"primary"} className="ml-auto">
                Submit
              </Button>
            </div>
          </Form>
        </div>
      </CardBody>
    </Card>
  );
};

export default SetupUpload;
