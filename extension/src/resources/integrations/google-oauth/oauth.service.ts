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

  public async clearCachedToken(): Promise<void> {
    this.logger.debug("Manually clearing cached token")
    await chrome.identity.removeCachedAuthToken({ token: this.token })
    this.token = null
    this.fetchedAt = null
  }

  public async getGoogleApiToken(options: Partial<chrome.identity.TokenDetails> = {}): Promise<string> {
    if (this.isTokenFresh()) {
      return this.token!
    }

    const finalOptions: chrome.identity.TokenDetails = {
      interactive: true,
      ...options
    }

    return new Promise((resolve, reject) => {
      chrome.identity.getAuthToken(finalOptions, async (token) => {
        if (chrome.runtime.lastError || !token) {
          const message = chrome.runtime.lastError?.message ?? "No token returned"
          this.logger.error(`Failed to get token: ${message}`)
          reject(message)
        }

        // 👇 Immediately test token to ensure validity
        const test = await fetch("https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=" + token)
        if (test.status === 401) {
          this.logger.error(`Token invalid, removing from cache`)
          chrome.identity.removeCachedAuthToken({ token: this.token }, () => {
            // Try again after removal
            this.getGoogleApiToken(options).then(resolve).catch(reject)
          })
          return
        }

        this.token = token as string
        this.fetchedAt = Date.now()
        resolve(this.token)
      })
    })
  }

  public async revokeAccessToken(): Promise<void> {
    const token = await this.getGoogleApiToken()
    await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`)
    this.logger.info("OAuth token revoked.")
    chrome.identity.removeCachedAuthToken({ token: this.token }).catch((err) => {
      console.log("Failed to remove cached auth", err)
    })
    this.token = null
    this.fetchedAt = null
  }

  public async getUserInfo(): Promise<{ email: string }> {
    const token = await this.getGoogleApiToken()
    const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!res.ok) {
      throw new Error("Failed to fetch user info")
    }

    const json = await res.json()
    return { email: json.email }
  }
}
