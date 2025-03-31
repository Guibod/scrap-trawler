import React from "react"
import { EventProvider } from "~/resources/ui/providers/event"
import EventLayout from "~/resources/ui/components/event/layout"

const EventPage = () => {
  return (
    <EventProvider>
      <EventLayout />
    </EventProvider>
  );
};

export default EventPage;
