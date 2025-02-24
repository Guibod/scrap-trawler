import React, { type FC } from "react"
import ButtonScrape from "~resources/ui/components/button.scrape"
import type { PlasmoCSUIProps } from "plasmo"
import Context from "~resources/eventlink/context"

const EventCalendarAction: FC<PlasmoCSUIProps> = ({ anchor }) => {
  const organizationId = Context.getOrganizationId(window.location.href)

  let eventId: string;
  try {
    const element = anchor.element.querySelector(".capacity-details")
    if (element) {
      eventId = element.getAttribute("id");
    }

    if (!eventId) {
      return null;
    }
  } catch (e) {
    return null;
  }

  return (
    <ButtonScrape
      eventId={eventId}
      organizationId={organizationId}
      className={"absolute mt-2 mr-2"}
      style={{ top: "-20px", right: "-35px" }}
      color={"primary"}
      variant={"ghost"}
      isIconOnly={true}
    />
  );
};

export default EventCalendarAction;
