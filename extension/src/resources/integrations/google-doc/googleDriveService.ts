import { OAuthService } from "~/resources/integrations/google-oauth/oauth.service"

const DRIVE_API = "https://www.googleapis.com/drive/v3/files"

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  modifiedTime?: Date
}
export class GoogleDriveService {
  private static instance: GoogleDriveService

  private constructor(private oauthService: OAuthService) {}

  static getInstance(oauth = OAuthService.getInstance()): GoogleDriveService {
    if (!this.instance) {
      this.instance = new GoogleDriveService(oauth)
    }
    return this.instance
  }

  async listAllSpreadsheets(query?: string): Promise<DriveFile[]> {
    const token = await this.oauthService.getGoogleApiToken()

    const qParts = [
      "mimeType = 'application/vnd.google-apps.spreadsheet'",
      "trashed = false"
    ]
    if (query?.trim()) {
      qParts.push(`name contains '${query.trim().replace(/'/g, "\\'")}'`)
    }

    const allFiles: DriveFile[] = []
    let pageToken: string | undefined = undefined

    do {
      const params = new URLSearchParams({
        q: qParts.join(" and "),
        fields: "files(id,name,mimeType,modifiedTime),nextPageToken",
        pageSize: "100",
        spaces: "drive"
      })
      if (pageToken) {
        params.set("pageToken", pageToken)
      }

      const res = await fetch(`${DRIVE_API}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) {
        throw new Error(`Drive query failed: ${res.statusText}`)
      }

      const json = await res.json()

      allFiles.push(
        ...json.files.map((item: { modifiedTime: string }) => ({
          ...item,
          modifiedTime: item.modifiedTime ? new Date(item.modifiedTime) : undefined
        }))
      )

      pageToken = json.nextPageToken
    } while (pageToken)

    return allFiles
  }

  async getFileMetadata(fileId: string): Promise<DriveFile> {
    const token = await this.oauthService.getGoogleApiToken()

    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,modifiedTime`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    if (!res.ok) {
      throw new Error("Failed to fetch file metadata")
    }

    const json = await res.json()
    return {
      id: json.id,
      name: json.name,
      mimeType: json.mimeType,
      modifiedTime: json.modifiedTime ? new Date(json.modifiedTime) : undefined
    }
  }

  static extractGoogleDriveFileId(url: string): string | null {
    const match = url.match(/^https?:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]{25,})/)
    return match?.[1] ?? null
  }
}
