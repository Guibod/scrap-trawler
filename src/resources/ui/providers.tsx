import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { HashRouter as Router } from "react-router-dom";
import React from "react";
import { SettingsProvider } from "~resources/ui/providers/settings"

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <HeroUIProvider>
      <ToastProvider disableAnimation={true} placement="bottom-right" toastProps={{
        radius: "sm",
        severity: "success",
        variant: "bordered",
        timeout: 5000,
        shouldShowTimeoutProgess: true
      }} />
      <SettingsProvider>
        <Router>{children}</Router>
      </SettingsProvider>
    </HeroUIProvider>
  );
};

export default Providers