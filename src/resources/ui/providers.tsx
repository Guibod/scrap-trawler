import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { HashRouter as Router, useNavigate, useHref } from "react-router-dom"
import React from "react";
import { SettingsProvider } from "~/resources/ui/providers/settings"
import { CardProvider } from "~/resources/ui/providers/card"
import { MtgJsonProvider } from "~/resources/ui/providers/mtgjson"

export const RoutedProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate()

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
      <ToastProvider disableAnimation={true} placement="bottom-right" toastProps={{
        radius: "sm",
        severity: "success",
        variant: "bordered",
        timeout: 5000,
      }} />
      <SettingsProvider>
        <MtgJsonProvider>
          <CardProvider>
            {children}
          </CardProvider>
        </MtgJsonProvider>
      </SettingsProvider>
    </HeroUIProvider>
  );
};

export const Providers = (props: { children: React.ReactNode }) => (
  <Router>
    <RoutedProvider>
      {props.children}
    </RoutedProvider>
  </Router>
)

export default Providers