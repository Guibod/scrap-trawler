import type { MatchDbo } from "~/resources/domain/dbos/match.dbo"
import { Chip } from "@heroui/chip"
import React from "react"

interface MatchResultProps {
  match: MatchDbo,
  teamId?: string
}

const MatchResult = ({match, teamId, ...props}: MatchResultProps) => {
  if (!teamId) {
    teamId = match.teamIds[0]
  }

  if (!match.results[teamId]) {
    return
  }

  const wins = match.results[teamId].wins
  const losses = match.results[teamId].losses
  const draws = match.results[teamId].draws
  const victory = wins > losses
  const draw = wins == losses
  const defeat = wins < losses

  return (
    <span>
      <Chip size="sm" title="Wins" color={victory?'primary':'default'}>{wins}</Chip>
      -
      <Chip size="sm" title="Draws" color={draw?'primary':'default'}>{draws}</Chip>
      -
      <Chip size="sm" title="Losses" color={defeat?'primary':'default'}>{losses}</Chip>
    </span>
  )
}

export default MatchResult;