import React from "react"
import { Card, CardBody } from "@heroui/card"
import OauthStatus from "~/resources/ui/components/oauth/status"
import { cn } from "@heroui/theme"

type GoogleIntegrationSettingsProps = {
  className?: string
}

const GoogleIntegrationSettings: React.FC<GoogleIntegrationSettingsProps> = ({className}) => {
  return (
    <Card className={cn("w-full max-w-lg", className)}>
      <CardBody className="flex flex-col gap-3">
        <h3 className="text-large font-semibold">Google Integration</h3>
        <p className="text-sm text-default-500">
          Scrap Trawler uses your Google account to fetch spreadsheets securely.
          This allows you to import decklists or player registrations from Google Sheets you own or have access to.
        </p>

        <OauthStatus />
      </CardBody>
    </Card>
  )
}

export default GoogleIntegrationSettings
