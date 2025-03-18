import { useMtgJson } from "~/resources/ui/providers/mtgjson"
import React, { useState } from "react"
import { Progress } from "@heroui/react"
import { Button } from "@heroui/button"
import { Card, CardBody, CardHeader } from "@heroui/card"

export const CardDatabaseSettings: React.FC = () => {
  const { tableSize, localVersion, remoteVersion, startImport, cancelImport, importProgress, importSize } = useMtgJson();
  const isOutdated = localVersion && remoteVersion && localVersion !== remoteVersion;
  const [isCanceling, setIsCanceling] = useState(false)
  const [isImporting, setIsImporting] = useState(!!importProgress)

  const smartStartImport = async () => {
    setIsImporting(true)
    await startImport()
    setIsImporting(false)
  }
  const smartCancelImport = async () => {
    setIsCanceling(true)
    await cancelImport()
    setIsCanceling(false)
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <h2 className="text-lg font-bold flex justify-between w-full align-text-bottom">
          Card Database
          {tableSize ? (<span className="text-sm">({tableSize} cards)</span>) : (<span className="text-sm text-warning">(no card yet)</span>)}
        </h2>
      </CardHeader>
      <CardBody className="text-medium">
      <p>Scrap Trawler relies on MTG-JSON curated JSON files, they are updated periodically.</p>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
          <dt>Local Version</dt>
          <dd>
            <span className={(isOutdated || !localVersion) ? "text-red-500" : "text-green-500"}>
              {localVersion || "not imported yet"}
            </span>
          </dd>
          <dt>Remote Version</dt>
          <dd>{remoteVersion}</dd>
        </dl>

        {isImporting && <Progress value={importProgress} maxValue={importSize} isIndeterminate={!importSize} size="lg" className="mt-4" showValueLabel={true} aria-label="settings-mtgjson-progress" />}
        {isImporting ? (
          <Button onPress={smartCancelImport} isLoading={isCanceling} color="danger" className="mt-4">
            Cancel Import
          </Button>
        ) : (
          <Button onPress={smartStartImport} color="primary" className="mt-4">
            Update Card Database
          </Button>
        )}
      </CardBody>
    </Card>
  );
};

export default CardDatabaseSettings;