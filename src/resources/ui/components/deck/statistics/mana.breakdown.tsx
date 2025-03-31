import { scaleBand, scaleLinear } from "@visx/scale"
import { Bar } from "@visx/shape"
import { Group } from "@visx/group"

import React from "react"
import SvgW from "~/resources/ui/components/mana/W"
import SvgU from "~/resources/ui/components/mana/U"
import SvgB from "~/resources/ui/components/mana/B"
import SvgR from "~/resources/ui/components/mana/R"
import SvgG from "~/resources/ui/components/mana/G"
import SvgC from "~/resources/ui/components/mana/C"
import { MTG_COLORS } from "~/resources/domain/enums/mtg/colors.dbo"
import { useDeck } from "~/resources/ui/components/deck/provider"
import { type CardFilterOptions, CardTypes, GroupBy } from "~/resources/domain/utils/deck.analyzer"
import { Progress } from "@heroui/react"
import { cn } from "@heroui/theme"
import { Tooltip } from "@heroui/tooltip"
import { percentage } from "~/resources/utils/math"

const COLOR_ORDER = [
  MTG_COLORS.WHITE,
  MTG_COLORS.BLUE,
  MTG_COLORS.BLACK,
  MTG_COLORS.RED,
  MTG_COLORS.GREEN,
  MTG_COLORS.COLORLESS,
]

const COLOR_NAMES: Record<MTG_COLORS, string> = {
  W: "white",
  U: "blue",
  B: "black",
  R: "red",
  G: "green",
  C: "colorless",
}

const SVG_COMPONENTS: Record<MTG_COLORS, React.FC<{ className?: string }>> = {
  W: SvgW,
  U: SvgU,
  B: SvgB,
  R: SvgR,
  G: SvgG,
  C: SvgC,
}

type Props = {
  width?: number
  height?: number
}

export function ManaColorBreakdown({ width = 100, height = 40 }: Props) {
  const { analyzer } = useDeck()

  const baseFilter: CardFilterOptions = {
    selector: ["-sideboard"]
  }

  const curveByColor = analyzer.manaCurve({...baseFilter, grouping: GroupBy.COLOR})
  const manaStats = analyzer.analyzeMana({ ... baseFilter })
  const nonLandCards = analyzer.count({ ...baseFilter, excludeTypes: [CardTypes.LAND]})
  const landCards = analyzer.count({ ...baseFilter, types: [CardTypes.LAND]})

  const maxValue = Math.max(
    ...COLOR_ORDER.map(color => {
      const curve = curveByColor.get(color)
      return curve ? Math.max(...curve.map(p => p.qty)) : 0
    }),
    1
  )

  const xScale = scaleBand<string>({
    domain: Array.from({ length: 8 }, (_, i) => i < 7 ? `${i}` : "7+"),
    range: [0, width],
    padding: 0.2,
  })

  const yScale = scaleLinear({
    domain: [0, maxValue],
    range: [height, 0],
  })

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 text-center gap-6 text-sm mt-4">
      {COLOR_ORDER.map(color => {
        const Svg = SVG_COMPONENTS[color]

        const colorFilter = { ...baseFilter, color }

        const nonLandColorCards = analyzer.count({ ...colorFilter, colors: [color], excludeTypes: [CardTypes.LAND]})
        const pips = manaStats.pips.get(color) ?? 0
        const producers = manaStats.production.get(color) ?? 0
        const isDimmed = nonLandColorCards === 0

        return (
          <div key={color} className={cn("flex flex-col items-center", isDimmed && "opacity-40")}>
            <div className="mb-2">
              <Svg className="w-8 h-8" />
            </div>

            <Tooltip content={<span><strong>{nonLandColorCards}</strong> out of <strong>{nonLandCards}</strong> non-land cards are {COLOR_NAMES[color]}</span>}>
              <div className="text-xl font-bold cursor-help">
                {percentage(nonLandColorCards, nonLandCards, 0)}
              </div>
            </Tooltip>

            <Tooltip content={<span><strong>{pips}</strong> out of <strong>{manaStats.totalPips}</strong> mana symbols are {COLOR_NAMES[color]}</span>}>
              <div className="text-muted-foreground text-x cursor-help">
                {percentage(pips, manaStats.totalPips, 0)} of all symbols
              </div>
            </Tooltip>

            <svg width={width} height={height} className="mt-1">
              <Group>
                {curveByColor.get(color)?.map(({ mv, qty }) => {
                  const key = mv >= 7 ? "7+" : `${mv}`
                  return (
                    <Bar
                      key={`mini histogram ${color} ${key}`}
                      x={xScale(key)}
                      y={yScale(qty)}
                      width={xScale.bandwidth()}
                      height={height - yScale(qty)}
                      rx={1}
                      className={`fill-mana-${color}`}
                    />
                  )
                })}
              </Group>
            </svg>

            <div className="flex flex-col items-center mt-4">
              <p className="text-muted-foreground text-xs mt-1">{COLOR_NAMES[color]} Mana Production</p>
              <Tooltip content={<span><strong>{producers}</strong> out of <strong>{landCards}</strong> lands produce {COLOR_NAMES[color]}</span>}>
                <Progress aria-label={`${color} mana bar`} classNames={{
                  indicator: `bg-mana-${color} rounded-full`,
                  base: `cursor-help`
                }} size="md" value={producers / landCards * 100} maxValue={100} />
              </Tooltip>
              <p className="text-muted-foreground text-xs mt-1">
                {percentage(producers, landCards, 0)} of symbols on lands
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
