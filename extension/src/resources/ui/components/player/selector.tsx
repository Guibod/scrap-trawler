import React from "react"
import type { Selection } from "@heroui/react"
import { Select, SelectItem } from "@heroui/select"
import { usePlayers } from "~/resources/ui/providers/event"
import { useState } from "react"
import Player from "~/resources/ui/components/player/player"

interface Props {
  value?: string
  onChange: (playerId: string) => void
  className?: string
}

export function PlayerSelector({ value, onChange, className }: Props) {
  const players = usePlayers()
  const [internalValue, setInternalValue] = useState<Selection>(new Set([value]));

  return (
    <Select
      className={className}
      selectedKeys={internalValue}
      onSelectionChange={(value) => {
        setInternalValue(value)
        onChange(value.currentKey)
      }}
      placeholder="Select a player"
      itemHeight={50}
    >
      {Object.entries(players).map(([key, player]) => (
        <SelectItem key={key} aria-label={`${player.firstName} ${player.lastName}`}>
          <Player playerId={key} aria-label={`Player ${key}`} link={false}/>
        </SelectItem>
      ))}
    </Select>
  )
}

export default PlayerSelector