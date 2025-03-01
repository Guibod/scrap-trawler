import React from "react"
import { HeroUIProvider } from "@heroui/system"
import "../resources/ui/style.css"
import { EventProvider } from "~resources/ui/providers/event"
import EventContainer from "~resources/ui/components/event/container"
import { ToastProvider } from "@heroui/react"
import { Modal } from "@heroui/modal"

const EventPage = () => {
  return (
    <HeroUIProvider>
      <ToastProvider />
      <EventProvider>
        <EventContainer />
      </EventProvider>
    </HeroUIProvider>
  );
};

export default EventPage;
