import React from "react"
import { Button } from "@heroui/button"
import { MagnifyingGlassIcon, RocketLaunchIcon, XCircleIcon } from "@heroicons/react/20/solid"

type PairingActionsProps = {
  matchByName: () => void
  assignRandomly: () => void
  unassignAll: () => void
}

const PairingActions: React.FC<PairingActionsProps> = ({ matchByName, assignRandomly, unassignAll }) => {
  return (
    <div className="mb-4 flex gap-4">
      <Button
        onPress={matchByName}
        color="primary"
        startContent={<MagnifyingGlassIcon className="fill-gray-500 stroke-black" />}
      >
        Match by Name
      </Button>

      <Button
        onPress={assignRandomly}
        color="secondary"
        startContent={<RocketLaunchIcon className="fill-gray-500 stroke-black" />}
      >
        Assign Randomly
      </Button>

      <Button
        onPress={unassignAll}
        color="danger"
        startContent={<XCircleIcon className="fill-gray-500 stroke-black" />}
      >
        Reset Assignments
      </Button>
    </div>
  )
}

export default PairingActions
