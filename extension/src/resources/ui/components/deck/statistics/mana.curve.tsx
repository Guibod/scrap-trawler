import React from "react"
import { scaleBand, scaleLinear } from "@visx/scale"
import { BarStack } from "@visx/shape"
import { AxisBottom } from "@visx/axis"
import { Group } from "@visx/group"
import { motion } from "framer-motion"
import { CardCategory, GroupBy } from "~/resources/domain/utils/deck.analyzer"
import { useDeck } from "~/resources/ui/components/deck/provider"
import { cn } from "@heroui/theme"

type Props = {
  width?: number
  height?: number
  onStackedHistogramClick?: (mv: string, category: CardCategory) => void,
  className?: string
}

type ManaCurveDatum = {
  mv: string
  permanent: number
  spell: number
}

export function ManaCurveHistogram({ width = 300, height = 120, className, onStackedHistogramClick }: Props) {
  const { analyzer } = useDeck()

  const rawMap = analyzer.manaCurve({selector: ["-sideboard"], grouping: GroupBy.CATEGORY})
  const raw: ManaCurveDatum[] = []
  const byMv = new Map<number, { permanent: number, spell: number }>()

  for (const [category, data] of rawMap.entries()) {
    if (category === CardCategory.OTHER) continue
    for (const { mv, qty } of data) {
      const slot = byMv.get(mv) ?? { permanent: 0, spell: 0 }
      slot[category] += qty
      byMv.set(mv, slot)
    }
  }

  for (const [mv, counts] of byMv.entries()) {
    raw.push({ mv: mv >= 7 ? "7+" : `${mv}`, ...counts })
  }
  const margin = { top: 10, bottom: 20, left: 10, right: 10 }
  const xMax = width - margin.left - margin.right
  const yMax = height - margin.top - margin.bottom

  const keys = ["permanent", "spell"] as const

  const xScale = scaleBand<string>({
    domain: raw.map(d => d.mv),
    range: [0, xMax],
    padding: 0.1,
  })

  const yScale = scaleLinear<number>({
    domain: [0, Math.max(...raw.map(d => d.permanent + d.spell), 1)],
    range: [yMax, 0],
  })

  const colorMap: Record<string, string> = {
    permanent: "#60a5fa",
    spell: "#f472b6",
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <svg width={width} height={height}>
        <Group top={margin.top} left={margin.left}>
          <BarStack<ManaCurveDatum, string>
            data={raw}
            keys={keys as unknown as string[]}
            x={d => d.mv}
            xScale={xScale}
            yScale={yScale}
            color={key => colorMap[key]}
          >
            {barStacks =>
              barStacks.map(barStack =>
                barStack.bars.map(bar => (
                  <motion.rect
                    data-testid="mana-bar"
                    key={`bar-${bar.index}-${bar.key}`}
                    x={bar.x}
                    y={bar.y}
                    width={bar.width}
                    height={bar.height}
                    fill={bar.color}
                    rx={2}
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    style={{ originX: 0.5, originY: 1, cursor: onStackedHistogramClick ? "pointer" : "default" }}
                    onClick={() => onStackedHistogramClick?.(bar.bar.data.mv, bar.key as CardCategory)}
                  />
                ))
              )
            }
          </BarStack>

          <AxisBottom
            top={yMax}
            scale={xScale}
            stroke="#ccc"
            tickStroke="#ccc"
            tickLabelProps={() => ({
              fill: "#888",
              fontSize: 10,
              textAnchor: "middle",
            })}
          />
        </Group>
      </svg>

      <div className="flex w-full items-center space-x-4 mt-2 px-2 text-xs text-muted-foreground">
        <div className="flex items-center space-x-1">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: colorMap.permanent }} />
          <span>Permanents</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: colorMap.spell }} />
          <span>Spells</span>
        </div>
      </div>
    </div>
  )
}