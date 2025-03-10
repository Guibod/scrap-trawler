import React, { useState } from "react"
import { Button } from "@heroui/button"
import { openApp } from "~/resources/ui/actions/open"

type ButtonOpenProps = {
  fake?: boolean
}

const ButtonOpen = ({fake}: ButtonOpenProps) => {
  return (
    <Button
      onClick={fake ? () => {} : () => openApp("")}
      className="font-sans px-4 py-2 bg-blue-600 text-white rounded-md flex items-center justify-center gap-2 hover:bg-blue-700 disabled:bg-gray-400 transition"
    >
      Scrape Trawler
    </Button>
  )
}

export default ButtonOpen