import { EventDao } from "~/resources/storage/event.dao"
import { formats, ImportExportService } from "~/resources/domain/import.export.service"
import { humanTimestamp } from "~/resources/utils/text"
import { handleFileDownload } from "~/resources/utils/download"

const defaultService = () => new ImportExportService(EventDao.getInstance())


export async function exportEventsToFile(
  eventIds: string[] | null,
  onProgress?: (index: number, size: number) => Promise<void>,
  service: ImportExportService = defaultService()
) {
  if (onProgress) service.onProgress(onProgress)

  const chunks = [];
  const sink = new WritableStream({
    write(chunk) {
      chunks.push(chunk)
    },
  })

  await service.exportEvents(sink, eventIds, formats.GZIP)

  const blob = new Blob(chunks, { type: "application/gzip" })
  const filename = `scrap-trawler.${eventIds ? "selection" : "export"}.${humanTimestamp()}.json.gz`
  handleFileDownload(blob, filename)
}

export async function importEventsFromFile(
  file: File,
  onProgress?: (index: number, size: number) => Promise<void>,
  service: ImportExportService = defaultService()
): Promise<void> {
  if (onProgress) service.onProgress(onProgress)

  const stream = file.stream()
  await service.importEvents(stream)
}
