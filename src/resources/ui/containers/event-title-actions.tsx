import { HeroUIProvider } from "@heroui/system"
import React, { useEffect, useState } from "react"
import ButtonScrape from "~resources/ui/components/button.scrape"
import ButtonToggle from "~resources/ui/components/button.toggle"
import Context from "~resources/eventlink/context"

const EventTitleActions = () => {
  const [eventId, setEventId] = useState(null)
  const [organizationId, setOrganizationId] = useState(null)

  useEffect(() => {
    setEventId(Context.getEventId(window.location.href))
    setOrganizationId(Context.getOrganizationId(window.location.href))
  }, [])

  if (!eventId || !organizationId) return

  return (
    <HeroUIProvider>
      <div className={"flex gap-2"}>
        <ButtonScrape organizationId={organizationId} eventId={eventId}/>
        <ButtonToggle />
      </div>
    </HeroUIProvider>
  )
};

export default EventTitleActions;