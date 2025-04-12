import { OauthService } from "../google-oauth/oauth.service"
import { getLogger } from "~/resources/logging/logger"

type SheetMetadata = { sheets: { properties: { sheetId: number; title: string } }[] }

export class GoogleSheetsService {
  private static instance: GoogleSheetsService
  private logger = getLogger("GoogleSheetService")

  private constructor(private oauthService: OauthService) {}

  static getInstance(oauthService: OauthService = OauthService.getInstance()): GoogleSheetsService {
    if (!GoogleSheetsService.instance) {
      GoogleSheetsService.instance = new GoogleSheetsService(oauthService);
    }
    return GoogleSheetsService.instance;
  }

  async fetchRange(sheetId: string, gid: string = "0", range: string = "A1:Z1000"): Promise<string[][]> {
    const token = await this.oauthService.getGoogleApiToken()

    // First, resolve the sheet name from the gid
    const metadataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?fields=sheets(properties(sheetId,title))`
    this.logger.debug(`Fetching metadata from ${metadataUrl}`)
    const metaRes = await fetch(metadataUrl, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!metaRes.ok) {
      throw new Error(`Failed to fetch sheet metadata: ${metaRes.statusText}`)
    }

    const metadata: SheetMetadata = await metaRes.json()
    const sheet = metadata.sheets.find((s) => s.properties.sheetId.toString() === gid)
    if (!sheet) {
      throw new Error(`No sheet found with gid ${gid}`)
    }
    const sheetName = sheet.properties.title
    this.logger.debug(`Resolved sheet "${sheetName}" from gid ${gid}, fetching range ${range}`)
    const dataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetName + "!" + range)}`
    const dataRes = await fetch(dataUrl, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!dataRes.ok) {
      throw new Error(`Google Sheets fetch failed: ${dataRes.statusText}`)
    }

    const json = await dataRes.json()

    return json.values as string[][]
  }

  static isSpreadsheetUrl(url: string): boolean {
    try {
      const parsed = new URL(url)
      return parsed.hostname === "docs.google.com" && parsed.pathname.startsWith("/spreadsheets/d/")
    } catch (e) {
      return false
    }
  }

  static parseSheetUrl(url: string): { sheetId: string; gid: string } {
    try {
      const parsed = new URL(url)

      const sheetIdMatch = parsed.pathname.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
      if (!sheetIdMatch) {
        throw new Error("Invalid Google Sheet URL: missing /spreadsheets/d/<id>")
      }

      const queryGid = parsed.searchParams.get("gid")
      if (queryGid) {
        return { sheetId: sheetIdMatch[1], gid: queryGid }
      }

      const hash = parsed.hash.startsWith("#") ? parsed.hash.slice(1) : parsed.hash
      const hashGid = new URLSearchParams(hash).get("gid") ?? "0"

      return { sheetId: sheetIdMatch[1], gid: hashGid }
    } catch (e) {
      throw new Error(`Invalid Google Sheet URL: ${e instanceof Error ? e.message : String(e)}`)
    }
  }
}
