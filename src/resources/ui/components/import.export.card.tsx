import React, { useState } from "react"
import { addToast, Button, Card, CardBody, CardHeader, Modal, Progress } from "@heroui/react"
import { ModalBody, ModalContent, ModalHeader } from "@heroui/modal"
import { exportEventsToFile, importEventsFromFile } from "~/resources/utils/export"


type ImportExportCardProps = {}

const ImportExportCard = ({}: ImportExportCardProps) => {
  const [progress, setProgress] = useState<{ index: number, size: number } | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [operation, setOperation] = useState<"import" | "export" | null>(null)

  const progressCallback = async (index: number, size: number | null) => {
    setProgress({ index, size })
  }

  const handleExport = async () => {
    try {
      setOperation("export");
      setIsModalOpen(true);
      setProgress({ index: 0, size: null });

      await new Promise((resolve) => setTimeout(resolve, 100)); // ⏳ Force render cycle before running export
      await exportEventsToFile(null, progressCallback)
        .then(() => {
          addToast({ title: "Export Successful", description: "Your data has been exported.", color: "success" });
        })
    } catch (error) {
      addToast({ title: "Export Failed", description: error.message, color: "danger" });
    } finally {
      setTimeout(() => {
        setIsModalOpen(false);
        setProgress(null);
      }, 500);
    }
  };


  const handleImport = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setOperation("import")
    setIsModalOpen(true)
    setProgress({ index: 0, size: null })
    try {
      await importEventsFromFile(file, progressCallback)
        .then(() => {
          addToast({ title: "Import Successful", description: "Your data has been imported.", color: "success" })
        })
    } catch (error) {
      addToast({ title: "Import Failed", description: error.message, color: "danger" })
    } finally {
      setIsModalOpen(false)
      setProgress(null)
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="text-lg font-semibold">Import & Export Data</CardHeader>
      <CardBody className="flex flex-col gap-4">
        <p className="text-medium">
          Scrap Trawler allows you to <strong>export</strong> and <strong>import</strong> tournament data for backup, transfer, or analysis.
        </p>
        <div>
          <h3 className="text-lg font-semibold">Export Data</h3>
          <p>
            Clicking the <strong>Export Data</strong> button will generate a <code className="bg-gray-200 px-1 rounded">.json.gz</code> file containing all stored tournament data.
            This file can be <strong>re-imported later</strong> to restore data or shared with others.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Import Data</h3>
          <p>
            You can <strong>import data</strong> from two file formats:
          </p>
          <ul className="list-disc list-inside mt-2">
            <li>
              <code className="px-1 rounded">.json.gz</code> - Compressed JSON (Recommended for large datasets, reduces file size).
            </li>
            <li>
              <code className="px-1 rounded">.json</code> - Standard JSON (Uncompressed, useful for manual edits).
            </li>
          </ul>
          <p className="mt-2">
            When you import a file, any existing event data will be <strong>replaced</strong> based on the file contents.
          </p>
        </div>

        <Button onPress={handleExport} color="primary" className="w-full py-2">
          Export Data
        </Button>
        <input type="file" accept=".json.gz,.json,.gz" onChange={handleImport} className="hidden" id="importFile" />
        <label htmlFor="importFile">
          <Button as="span" color="secondary" className="w-full py-2 cursor-pointer">
            Import Data
          </Button>
        </label>
      </CardBody>

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <ModalContent>
            <ModalHeader>{operation === "import" ? "Importing Data" : "Exporting Data"}</ModalHeader>
            <ModalBody>
              <Progress value={progress.index ?? 0} isIndeterminate={!progress.size} color="secondary"/>

              <p>Please wait...</p>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Card>
  )
}

export default ImportExportCard
