import React from "react"
import { Button } from "@heroui/button"
import { Spinner } from "@heroui/react"
import { CheckIcon } from "@heroicons/react/24/solid"
import { useOAuth } from "~/resources/ui/components/oauth/provider"

type OauthStatusProps = {
  className?: string
}

const OauthStatus: React.FC<OauthStatusProps> = ({ className }) => {
  const { connected, connecting, login, logout, identity } = useOAuth()

  if (connecting) {
    return <Spinner label="Connecting to Google..." className={className} />
  }

  return (
    <div className={className}>
      {connected ? (
        <div className="flex items-center gap-2">
          <CheckIcon className="w-5 h-5 text-green-500" />
          <span className="text-sm">Connected as {identity}</span>
          <Button className="ml-auto" size="sm" color="danger" onPress={logout}>
            Disconnect
          </Button>
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
