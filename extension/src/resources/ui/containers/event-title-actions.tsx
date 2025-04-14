import React, { useEffect, useState } from "react"
import ButtonOpen from "~/resources/ui/components/button.open"
import Context from "~/resources/integrations/eventlink/context"
import ButtonScrape from "~/resources/ui/components/button.scrape"

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
      <ButtonScrape variant="bordered" organizationId={organizationId} eventId={eventId}/>
      <ButtonOpen />
    </div>
  )
};

export default EventTitleActions;