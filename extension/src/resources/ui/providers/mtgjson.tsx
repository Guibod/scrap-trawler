import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import MtgJsonService, { type MtgJsonImportCompletion } from "~/resources/integrations/mtg-json/service"
import { addToast } from "@heroui/react"
import { sendToBackground } from "@plasmohq/messaging"
import { isMtgJsonImportProgress, type MtgJsonImportRequest } from "~/background/messages/mtgjson/import"
import CardService from "~/resources/domain/services/card.service"
import type { MtgJsonAbortRequest } from "~/background/messages/mtgjson/abort";

interface MtgJsonContextType {
  mtgJsonService: MtgJsonService | null;
  tableSize: number | null; // Total number of cards before the import starts
  importProgress: number | null;
  importSize: number | null; // Estimated size of the import
  localVersion: string | null;
  remoteVersion: string | null;
  isOutdated: boolean;
  startImport: () => Promise<void>;
  cancelImport: () => Promise<void>;
}

const MtgJsonContext = createContext<MtgJsonContextType | null>(null);

export const MtgJsonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mtgJsonService, setMtgJsonService] = useState<MtgJsonService | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [localVersion, setLocalVersion] = useState<string | null>(null);
  const [remoteVersion, setRemoteVersion] = useState<string | null>(null);
  const [importSize, setImportSize] = useState(null)

  useEffect(() => {
    const service = MtgJsonService.getInstance();

    const listener = (message: any) => {
      if (isMtgJsonImportProgress(message)) {
        setProgress(message.progress)
        setTotal(Math.max(total, message.progress))
      }
    }

    setMtgJsonService(service);

    service.estimateImportSize().then(setImportSize);
    service.getRemoteVersion().then(setRemoteVersion);
    service.getLocalVersion().then(setLocalVersion);
    service.count().then(setTotal);
    chrome.runtime.onMessage.addListener(listener)

    return () => {
      chrome.runtime.onMessage.removeListener(listener)
    }
  }, []);

  const cancelImport = useCallback(async () => {
    if (!mtgJsonService) return;

    await sendToBackground<MtgJsonAbortRequest, boolean>({ name: "mtgjson/abort" })
      .then(async (success) => {
        if (success) {
          addToast({
            title: "MTG-JSON Import",
            description: "Import canceled by user request",
            severity: "warning"
          })
        } else {
          addToast({
            title: "MTG-JSON Import",
            description: "Failed to cancel import",
            severity: "danger"
          })
        }
      })
  }, [mtgJsonService])

  const startImport = useCallback(async () => {
    if (!mtgJsonService) return;

    await sendToBackground<MtgJsonImportRequest, MtgJsonImportCompletion>({ name: "mtgjson/import" })
      .then(async (response) => {
        setLocalVersion(response.version)
        setTotal(response.count)
        setProgress(null)
        addToast({
          title: "MTG-JSON Import",
          description: `Imported version ${response.version}, with ${response.count} cards`,
          severity: "success"
        })
        CardService.getInstance().buildIndex()
      })
      .catch((error) => {
        setProgress(null)
        setTotal(null)
        addToast({
          title: "MTG-JSON Import",
          description: `Failed to import MTG-JSON: ${error.message}`,
          severity: "danger"
        })
      })
  }, [mtgJsonService]);

  return (
    <MtgJsonContext.Provider value={{
      mtgJsonService,
      importProgress: progress,
      tableSize: total,
      localVersion,
      remoteVersion,
      isOutdated: localVersion !== null && remoteVersion !== null && localVersion !== remoteVersion,
      startImport,
      cancelImport,
      importSize
    }}>
      {children}
    </MtgJsonContext.Provider>
  );
};

export const useMtgJson = (): MtgJsonContextType => {
  const context = useContext(MtgJsonContext);
  if (!context) {
    throw new Error("useMtgJson must be used within an MtgJsonProvider");
  }
  return context;
};
