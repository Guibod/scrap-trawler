import React, { useCallback, useEffect, useRef, useState } from "react"
import { GoogleDriveService } from "~/resources/integrations/google-doc/googleDriveService"
import { createPortal } from "react-dom"
import GooglePicker from "~/resources/ui/components/google-drive/picker"

const DEFAULT_DELAY = 5 * 60 * 1000

export function useDriveFileWatcher(
  fileId: string | null,
  lastImported: Date | null,
  onUpdate: () => void,
  delay: number = DEFAULT_DELAY
) {
  const timeoutRef = useRef<number | null>(null)
  const lastImportedRef = useRef(lastImported)

  useEffect(() => {
    lastImportedRef.current = lastImported
  }, [lastImported])

  const loop = useCallback(async () => {
    if (!fileId || !lastImportedRef.current) return

    try {
      console.debug("[Drive Watcher] Tick")

      const file = await GoogleDriveService.getInstance().getFileMetadata(fileId)
      const modified = file.modifiedTime ? new Date(file.modifiedTime).getTime() : null
      const last = lastImportedRef.current.getTime()

      console.debug("[Drive Watcher] Check timestamps", { modified, last })

      if (modified && modified > last) {
        console.info("[Drive Watcher] File was modified, calling update")
        await onUpdate()
      }
    } catch (err) {
      console.warn("[Drive Watcher] Error during check", err)
    } finally {
      timeoutRef.current = window.setTimeout(loop, delay)
    }
  }, [fileId, onUpdate, delay])

  useEffect(() => {
    if (!fileId) return
    timeoutRef.current = window.setTimeout(loop, delay)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [fileId, loop, delay])
}

export function useGooglePicker() {
  const resolveRef = useRef<(url: string | null) => void>()
  const [active, setActive] = useState(false)

  const show = useCallback(() => {
    return new Promise<string | null>((resolve) => {
      resolveRef.current = resolve
      setActive(true)
    })
  }, [])

  const handlePick = (url: string | null) => {
    resolveRef.current?.(url)
    resolveRef.current = undefined
    setActive(false)
  }

  const portal = active
    ? createPortal(
      <GooglePicker onPick={handlePick} />,
      document.body
    )
    : null

  return { show, portal }
}