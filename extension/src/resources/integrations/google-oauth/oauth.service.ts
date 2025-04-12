import { getLogger } from "~/resources/logging/logger"

export class OauthService {
  private static instance: OauthService
  private logger = getLogger("OauthService")

  private token: string | null = null
  private fetchedAt: number | null = null
  private readonly maxAgeMs = 60 * 60 * 1000 // 1 hour

  private constructor() {}

  static getInstance(): OauthService {
    if (!OauthService.instance) {
      OauthService.instance = new OauthService()
    }
    return OauthService.instance
  }

  private isTokenFresh(): boolean {
    return !!this.token && !!this.fetchedAt && (Date.now() - this.fetchedAt < this.maxAgeMs)
  }

  public clearCachedToken(): void {
    this.logger.debug("Manually clearing cached token")
    this.token = null
    this.fetchedAt = null
  }

  public async getGoogleApiToken(options: Partial<chrome.identity.TokenDetails> = {}): Promise<string> {
    if (this.isTokenFresh()) {
      this.logger.debug("Returning cached token")
      return this.token!
    }

    const finalOptions: chrome.identity.TokenDetails = {
      interactive: true,
      ...options
    }

    const token = await new Promise<string>((resolve, reject) => {
      chrome.identity.getAuthToken(finalOptions, (token) => {
        if (chrome.runtime.lastError) {
          this.logger.error(`Failed to get token: ${chrome.runtime.lastError.message}`)
          reject(chrome.runtime.lastError.message)
        } else if (!token) {
          this.logger.error("No token returned")
          reject("No token returned")
        } else {
          this.logger.debug(`Fetched new Google API token: ${token}`)
          resolve(token as string)
        }
      })
    })

    this.token = token
    this.fetchedAt = Date.now()
    return token
  }
}
