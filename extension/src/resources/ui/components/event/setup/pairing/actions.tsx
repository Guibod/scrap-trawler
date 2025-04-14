import React, { type Dispatch, type SetStateAction } from "react"
import { Button } from "@heroui/button"
import { MagnifyingGlassIcon, RocketLaunchIcon, XCircleIcon } from "@heroicons/react/20/solid"
import { Select, type Selection, SelectItem, SelectSection } from "@heroui/react"
import { pairingModeDescription } from "~/resources/domain/dbos/mapping.dbo"

type PairingActionsProps = {
  matchByName: () => void
  assignRandomly: () => void
  unassignAll: () => void
  setModeFilter: Dispatch<SetStateAction<Selection>>,
  modeFilter: Selection
}

const PairingActions: React.FC<PairingActionsProps> = ({ matchByName, assignRandomly, unassignAll, modeFilter, setModeFilter }) => {
  return (
    <div className="mb-4 flex gap-4">
      <Select
        className="max-w-xs"
        label="Filter by Pairing Mode"
        placeholder="Select one or more pairing mode"
        selectedKeys={modeFilter}
        selectionMode="multiple"
        onSelectionChange={setModeFilter}
      >
        <SelectItem key={"none"}>Not paired yet</SelectItem>
        <SelectItem key={"manual"}>{pairingModeDescription("manual")}</SelectItem>
        <SelectItem key={"random"}>{pairingModeDescription("random")}</SelectItem>
        <SelectSection title="By Name">
          <SelectItem key={"name-strict"}>{pairingModeDescription("name-strict")}</SelectItem>
          <SelectItem key={"name-swap"}>{pairingModeDescription("name-swap")}</SelectItem>
          <SelectItem key={"name-first-initial"}>{pairingModeDescription("name-first-initial")}</SelectItem>
          <SelectItem key={"name-last-initial"}>{pairingModeDescription("name-last-initial")}</SelectItem>
          <SelectItem key={"name-levenshtein"}>{pairingModeDescription("name-levenshtein")}</SelectItem>
        </SelectSection>
      </Select>
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
