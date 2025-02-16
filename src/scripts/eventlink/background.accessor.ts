export class BackgroundAccessor {
  private cookieGetter: (details: chrome.cookies.Details, callback: (cookie: chrome.cookies.Cookie | null) => void) => void;

  constructor(
    cookieGetter?: (details: chrome.cookies.Details, callback: (cookie: chrome.cookies.Cookie | null) => void) => void
  ) {
    this.cookieGetter = cookieGetter || chrome.cookies.get;
  }

  async getAuthCookie(): Promise<string | null> {
    return new Promise((resolve) => {
      this.cookieGetter({ url: "https://eventlink.wizards.com", name: "clientAuth" }, (cookie) => {
        resolve(cookie ? cookie.value : null);
      });
    });
  }

  async getAccessToken(): Promise<string | null> {
    return this.getAuthCookie()
      .then((authCookie: string | null) => {
        if (!authCookie) return null;
        const authCookieJson = atob(authCookie);
        const payload: { access_token: string } = JSON.parse(authCookieJson);
        return payload.access_token;
      })
      .catch(async (e) => {
        console.error("Failed to access token: ", e);
        return null;
      });
  }
}
