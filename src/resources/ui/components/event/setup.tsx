import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import React, { useState } from "react";
import { Alert } from "@heroui/alert";
import { PairStatus } from "~resources/domain/enums/status.dbo";
import { useEvent } from "~resources/ui/providers/event";
import {
  COLUMN_TYPE,
  DUPLICATE_HANDLING_STRATEGY,
} from "~resources/domain/enums/spreadsheet.dbo";
import Spreadsheet from "~resources/ui/components/spreadsheet/spreadsheet";
import { SpreadsheetParserFactory } from "~resources/domain/parsers/spreadsheet.parser.factory";
import type {
  RawSpreadsheetRow, SpreadsheetColumnMetaData,
  SpreadsheetMetadata
} from "~resources/domain/dbos/spreadsheet.dbo"

const EventSetup = () => {
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

  const handleColumnMapping = (column: SpreadsheetColumnMetaData) => {
    const updatedColumns = spreadsheetMeta.columns.map((col) =>
      col.index === column.index ? column : col
    );

    setSpreadsheetMeta((prev) => ({ ...prev, columns: updatedColumns }));

    updateEvent({
      spreadsheet: { ...event.spreadsheet, meta: { ...event.spreadsheet.meta, columns: updatedColumns } },
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSpreadsheetMeta((prev) => {
      const updatedMeta = { ...prev, source: file.name };
      processFile(file, updatedMeta);
      return updatedMeta;
    });
  };

  const processFile = async (file: File, metadata: SpreadsheetMetadata) => {
    const reader = new FileReader();

    reader.onload = async (evt) => {
      if (!evt.target?.result) return;

      const parser = SpreadsheetParserFactory.create(metadata);
      const { columns, rows } = await parser.parse(evt.target.result);

      setSpreadsheetMeta((prev) => ({ ...prev, columns }));
      setSpreadsheetData(rows);

      updateEvent({
        spreadsheet: { ...event.spreadsheet, meta: { ...metadata, columns } },
        raw_data: { ...event.raw_data, spreadsheet: rows },
      });
    };

    if (file.name.endsWith(".csv")) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div>
      {event.status.pair === PairStatus.NOT_STARTED && (
        <Alert
          isClosable={true}
          color="warning"
          description={
            <div>
              <p>
                This event is missing its spreadsheet configuration! To unlock Scrap Trawler's full potential, you'll need to provide a spreadsheet containing:
              </p>
              <ul className={"list-disc list-inside"}>
                <li><span className={"font-black"}>Decklists</span> – Link players to their decks</li>
                <li><span className={"font-black"}>Archetypes</span> – Categorize decks for analysis</li>
                <li><span className={"font-black"}>Private Data</span> – Any additional metadata for TO use</li>
              </ul>
              <p>
                Without this, Scrap Trawler can only display basic event data. Configure your spreadsheet now to enhance pairing, standings, and deck insights!
              </p>
            </div>
          }
          title="Event not configured yet"
        />
      )}

      <Card>
        <CardHeader title={"Setup Mode - Pair Players & Decklists"} />
        <CardBody>
          <p>Use top-right toggle button to switch to the event view</p>

          <div className="mb-4">
            <Input type="file" onChange={handleFileUpload} />
            <Button className="mt-2">Sync Google Sheets</Button>
          </div>

          {spreadsheetData && (
            <Spreadsheet
              meta={spreadsheetMeta}
              data={spreadsheetData}
              onColumnMappingChange={handleColumnMapping}
            />
          )}

          <Button className="mt-4 bg-green-600 text-white">
            🔒 Lock Decklists & Proceed
          </Button>
        </CardBody>
      </Card>
    </div>
  );
};

export default EventSetup;
