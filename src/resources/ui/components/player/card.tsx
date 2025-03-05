import { Card, CardBody } from "@heroui/card"
import Player, { type PlayerProps } from "~resources/ui/components/player/player"
import React from "react"


const PlayerCard = ({ ...props }: PlayerProps) => {
  return (
    <Card className="shadow-md border p-4">
      <CardBody>
        <Player {...props} />
      </CardBody>
    </Card>
  )
}

export default PlayerCard