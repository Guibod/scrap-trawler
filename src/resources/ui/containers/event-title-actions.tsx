import React, { useEffect, useState } from "react"
import ButtonToggle from "~resources/ui/components/button.toggle"
import Context from "~resources/eventlink/context"
import ButtonScrape from "~resources/ui/components/button.scrape"

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
      <ButtonScrape organizationId={organizationId} eventId={eventId}/>
      <ButtonToggle />
    </div>
  )
};

export default EventTitleActions;