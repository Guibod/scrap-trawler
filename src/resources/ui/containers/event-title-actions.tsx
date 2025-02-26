import { HeroUIProvider } from "@heroui/system"
import React, { useEffect, useState } from "react"
import { ButtonScrapeEventLink } from "~resources/ui/components/button.scrape"
import ButtonToggle from "~resources/ui/components/button.toggle"
import Context from "~resources/eventlink/context"
import { ToastProvider } from "@heroui/react"

const EventTitleActions = () => {
  const [eventId, setEventId] = useState(null)
  const [organizationId, setOrganizationId] = useState(null)

  useEffect(() => {
    setEventId(Context.getEventId(window.location.href))
    setOrganizationId(Context.getOrganizationId(window.location.href))
  }, [])

  if (!eventId || !organizationId) return

  return (
    <div className={"flex gap-2"}>
      <ButtonScrapeEventLink organizationId={organizationId} eventId={eventId}/>
      <ButtonToggle />
    </div>
  )
};

export default EventTitleActions;