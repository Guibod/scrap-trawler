import { Group } from '@visx/group'
import { Line } from '@visx/shape'
import { Text } from '@visx/text'
import { usePlayers } from "~/resources/ui/providers/event"
import type { PlayerProfile } from "~/resources/domain/mappers/player.mapper"
import { Avatar } from "@heroui/avatar"

interface Props {
  player: PlayerProfile
}

const NODE_SIZE = 48
const SPACING_X = 100
const SPACING_Y = 100

export function PlayerMatchesGraph({ player }: Props) {
  const players = usePlayers()
  const matches = player.matches || []

  const height = NODE_SIZE + 60
  const width = matches.length * SPACING_X + NODE_SIZE

  return (
    <svg width={width} height={height}>
      <Group top={20} left={SPACING_X / 2}>
        {matches.map((match, index) => {
          const x = index * SPACING_X
          const opponent = players[match.opponentPlayerIds[0]]
          const score = `${match.result.wins}-${match.result.losses}-${match.result.draws}`

          return (
            <Group key={match.matchId} left={x}>
              {/* Connector line to next node */}
              {index < matches.length - 1 && (
                <Line
                  from={{ x: NODE_SIZE / 2, y: NODE_SIZE / 2 }}
                  to={{ x: SPACING_X + NODE_SIZE / 2, y: NODE_SIZE / 2 }}
                  stroke="#ccc"
                  strokeWidth={2}
                />
              )}

              {/* Opponent avatar node */}
              <foreignObject width={NODE_SIZE} height={NODE_SIZE} x={0} y={0}>
                <div className="rounded-full overflow-hidden w-12 h-12">
                  <Avatar src={opponent.avatar} />
                </div>
              </foreignObject>

              {/* Score below */}
              <Text x={NODE_SIZE / 2} y={NODE_SIZE + 18} textAnchor="middle" fontSize={12} fill="#333">
                {score}
              </Text>
            </Group>
          )
        })}
      </Group>
    </svg>
  )
}
