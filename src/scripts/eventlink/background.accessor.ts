export const getAuthCookie = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    chrome.cookies.get({ url: "https://eventlink.wizards.com", name: "clientAuth" }, (cookie) => {
      resolve(cookie ? cookie.value : null);
    });
  });
};

export const getAccessToken = async (): Promise<string | null> => {
  return getAuthCookie().then((authCookie: string | null) => {
    const authCookieJson = atob(authCookie);
    const payload: { access_token: string} = JSON.parse(authCookieJson);
    return payload.access_token;
  }).catch(async (e) => {
    console.error("Failed to access token: ", e);
    return null;
  });
}