import React, { useState } from "react"
import { eventScrape } from "~resources/ui/actions/event.scrape"
import { Button } from "@heroui/button"
import { ArrowPathIcon } from "@heroicons/react/16/solid"
import { toggleSidePanel } from "~resources/ui/actions/sidepanel.toggle"

const ButtonToggle = () => {
  return (
    <Button
      onClick={toggleSidePanel}
      className="font-mtg px-4 py-2 bg-blue-600 text-white rounded-md flex items-center justify-center gap-2 hover:bg-blue-700 disabled:bg-gray-400 transition"
    >
      Open Sidepanel
    </Button>
  )
}

export default ButtonToggle