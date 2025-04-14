import React from "react"
import { Button } from "@heroui/button"
import { Spinner } from "@heroui/react"
import { CheckIcon } from "@heroicons/react/24/solid"
import { useOAuth } from "~/resources/ui/components/oauth/provider"
import { DriveAccessSummary } from "~/resources/ui/components/google-drive/summary"

type OauthStatusProps = {
  className?: string
}

const OauthStatus: React.FC<OauthStatusProps> = ({ className }) => {
  const { connected, connecting, checking, login, revoke, identity } = useOAuth()
  if (checking) {
    return <Spinner label="Checking status..." className={className} />
  }

  if (connecting) {
    return <Spinner label="Connecting to Google..." className={className} />
  }

  return (
    <div className={className}>
      {connected ? (
        <div>
          <div className="flex items-center gap-2">
            <CheckIcon className="w-5 h-5 text-green-500" />
            <span className="text-sm">Connected as {identity}</span>
            <Button className="ml-auto" size="sm" color="danger" onPress={revoke}>
              Disconnect
            </Button>
          </div>
          <DriveAccessSummary className="mt-4"/>
        </div>
      ) : (
        <Button color="primary" onPress={login}>
          Connect Google
        </Button>
      )}

    </div>
  )
}

export default OauthStatus
