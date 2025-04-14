import React from "react"
import { EventProvider } from "~/resources/ui/providers/event"
import EventLayout from "~/resources/ui/components/event/layout"
import { EventSetupProvider } from "~/resources/ui/components/event/setup/provider"

const EventPage = () => {
  return (
    <EventProvider>
      <EventSetupProvider>
        <EventLayout />
      </EventSetupProvider>
    </EventProvider>
  );
};

export default EventPage;
