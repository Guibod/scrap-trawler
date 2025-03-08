import React from "react"
import { EventProvider } from "~resources/ui/providers/event"
import EventContainer from "~resources/ui/components/event/container"

const EventPage = () => {
  return (
    <EventProvider>
      <EventContainer />
    </EventProvider>
  );
};

export default EventPage;
