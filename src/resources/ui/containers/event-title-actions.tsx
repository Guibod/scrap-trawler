import { HeroUIProvider } from "@heroui/system"
import React from "react"
import ButtonScrape from "~resources/ui/components/button.scrape"
import ButtonToggle from "~resources/ui/components/button.toggle"

const EventTitleActions = () => {
    return (
      <HeroUIProvider>
        <div className={"flex gap-2"}>
          <ButtonScrape />
          <ButtonToggle />
        </div>
      </HeroUIProvider>
    )
};

export default EventTitleActions;