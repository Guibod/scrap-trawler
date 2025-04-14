import { OauthService } from "~/resources/integrations/google-oauth/oauth.service"
import React, { createContext, useCallback, useContext, useEffect, useState } from "react"

type OAuthContextType = {
  connected: boolean;
  connecting: boolean;
  checking: boolean;
  identity: string | null
  token: string | null
  login: () => Promise<void>;
  logout: () => Promise<void>;
  revoke: () => Promise<void>;
}

type OAuthProviderProps = {
  children: React.ReactNode,
  oauthService?: OauthService
}

const CHECK_INTERVAL = 1000 * 60 * 5 // 5 minutes
const OAuthContext = createContext<OAuthContextType | null>(null)

export const OAuthProvider: React.FC<OAuthProviderProps> = ({ children, oauthService = OauthService.getInstance() }) => {
  const [token, setToken] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [checking, setChecking] = useState(false)
  const [identity, setIdentity] = useState<string | null>(null)

  const checkConnection = useCallback(async () => {
    setChecking(true)
    console.log("checkConnection, start")
    try {
      setToken(await oauthService.getGoogleApiToken({ interactive: false }))
      console.log("checkConnection, token", token)
      const { email } = await oauthService.getUserInfo()
      console.log("checkConnection, email", email)
      setConnected(true)
      setIdentity(email)
    } catch(e) {
      console.error(e)
      setConnected(false)
      setToken(null)
      setIdentity(null)
    } finally {
      setChecking(false)
    }
  }, [])

  useEffect(() => {
    checkConnection()
    const interval = setInterval(checkConnection, CHECK_INTERVAL) // every 5 min
    return () => clearInterval(interval)
  }, [checkConnection])

  const login = useCallback(async () => {
    setConnecting(true)
    try {
      const token = await oauthService.getGoogleApiToken({ interactive: true })
      const { email } = await oauthService.getUserInfo()
      setConnected(true)
      setToken(token)
      setIdentity(email)
    } finally {
      setConnecting(false)
    }
  }, [])

  const logout = useCallback(async () => {
    await oauthService.clearCachedToken()
    setConnected(false)
    setToken(null)
    setIdentity(null)
  }, [])

  const revoke = useCallback(async () => {
    await oauthService.revokeAccessToken()
    setConnected(false)
    setToken(null)
    setIdentity(null)
  }, [])

  return (
    <OAuthContext.Provider value={{ connected, connecting, checking, identity, login, logout, revoke, token }}>
      {children}
    </OAuthContext.Provider>
  )
}

export const useOAuth = () => {
  const ctx = useContext(OAuthContext)
  if (!ctx) throw new Error("useOAuth must be used within OAuthProvider")
  return ctx
}
