import React from "react"
import { HeroUIProvider } from "@heroui/system"
import "../resources/ui/style.css"
import { EventProvider } from "~resources/ui/providers/event"
import EventContainer from "~resources/ui/components/event/container"
import { ToastProvider } from "@heroui/react"

const EventPage = () => {
  return (
    <HeroUIProvider>
      <ToastProvider disableAnimation={true}/>
      <EventProvider>
        <EventContainer />
      </EventProvider>
    </HeroUIProvider>
  );
};

export default EventPage;
