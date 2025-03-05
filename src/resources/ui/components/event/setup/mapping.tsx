import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { useEventSetup } from "~resources/ui/components/event/setup/provider"
import SpreadsheetColumn from "~resources/ui/components/event/setup/mapping/column"
import React, { useState } from "react"
import MappingTable from "~resources/ui/components/event/setup/mapping/table"
import { Switch } from "@heroui/switch"
import { Alert } from "@heroui/alert"

const SetupReview = () => {
  const { spreadsheetMeta, handleColumnMapping, status} = useEventSetup();
  const [advancedMode, setAdvancedMode] = useState(false)

  return (
    <Card className="mt-4">
      <CardHeader className="w-full h-full flex items-center justify-between gap-x-4">
        <Switch className="ml-auto" size="sm" isSelected={advancedMode} onValueChange={setAdvancedMode}>Advanced mode</Switch>
      </CardHeader>
      <CardBody>
        {!status.isMappingComplete && (
          <Alert className="mb-1" title="The mapping is incomplete" color={"danger"}>
            There are still columns that need to be mapped to the correct data type.

            <ul className="list-disc">
              {status.missingColumns.map(column => (
                <li key={column}>{column}</li>
              ))}
            </ul>
          </Alert>
        )}
        {status.isMappingComplete && (
          <Alert className="mb-1" title="Mapping is completed" color={"success"} isClosable={true}>
            All mandatory columns have been mapped.
          </Alert>
        )}
        {!advancedMode && (
        <ul className="grid grid-cols-2 gap-2">
          {spreadsheetMeta.columns.map((col) => (
            <li key={col.index} className="flex justify-between items-center">
              <SpreadsheetColumn column={col} onUpdate={handleColumnMapping} showType={true} />
            </li>
          ))}
        </ul>
        )}
        {advancedMode && (
          <MappingTable />
        )}
      </CardBody>
    </Card>
  );
};

export default SetupReview;
