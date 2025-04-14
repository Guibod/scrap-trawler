import { humanReadable, MTG_COLORS } from "~/resources/domain/enums/mtg/colors.dbo"
import React from "react"
import W from "~/resources/ui/components/mana/W"
import U from "~/resources/ui/components/mana/U"
import B from "~/resources/ui/components/mana/B"
import R from "~/resources/ui/components/mana/R"
import G from "~/resources/ui/components/mana/G"
import C from "~/resources/ui/components/mana/C"
import { Tooltip } from "@heroui/tooltip"

type ColorIdentityProps = {
  identity: MTG_COLORS[],
  size: "sm" | "md" | "lg"
}

const ColorIdentity: React.FC<ColorIdentityProps> = ({ identity, size = "md" }) => {
  if (!identity) return

  return (
    <Tooltip content={humanReadable(identity)}>
      <div className={`flex gap-1`}>
        {identity.length === 0 && <C size={size}/>}
        {identity.includes(MTG_COLORS.WHITE) && <W size={size}/>}
        {identity.includes(MTG_COLORS.BLUE) && <U size={size}/>}
        {identity.includes(MTG_COLORS.BLACK) && <B size={size}/>}
        {identity.includes(MTG_COLORS.RED) && <R size={size}/>}
        {identity.includes(MTG_COLORS.GREEN) && <G size={size} />}
      </div>
    </Tooltip>
  )
}

export default ColorIdentity