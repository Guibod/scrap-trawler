import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { HashRouter as Router } from "react-router-dom";
import React from "react";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <HeroUIProvider>
      <ToastProvider disableAnimation={true} />
      <Router>{children}</Router>
    </HeroUIProvider>
  );
};

export default Providers