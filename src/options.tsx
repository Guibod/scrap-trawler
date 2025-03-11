import SettingsPage from "~/resources/ui/pages/settings"
import React from "react"
import { SettingsProvider } from "~/resources/ui/providers/settings"
import "~/resources/ui/style.css"
import OptionPageLayout from "~resources/ui/layouts/options"

const Options = () => {
  return (
    <OptionPageLayout>
      <SettingsProvider>
        <SettingsPage />
      </SettingsProvider>
    </OptionPageLayout>
  );
}

export default Options