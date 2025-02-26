import React from "react"
import { Card, CardBody, CardHeader } from "@heroui/card"

const EventEmpty = () => {
  return (
    <div className="flex-1 p-6 bg-gray-100">
      <Card>
        <CardHeader className={"text-2xl font-mtg"}>
          Empty event 😖
        </CardHeader>
        <CardBody>
          <p>This event is empty, that’s because it was scrap too late from EventLink and was completely emptied of tournament information.</p>

          <p>This screen will soon allow you to access some information though.</p>
        </CardBody>
      </Card>
    </div>
  );
}

export default EventEmpty