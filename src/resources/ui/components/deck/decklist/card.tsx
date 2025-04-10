import type { CardDbo } from "~/resources/domain/dbos/card.dbo"
import { ViewMode } from "~/resources/ui/components/deck/enum"
import { cn } from "@heroui/theme"
import { useEvent } from "~/resources/ui/providers/event"
import { useEffect, useState } from "react"
import { LegalitiesEnum } from "~/resources/domain/enums/legalities.dbo"

interface Props {
  card: CardDbo
  quantity: number
  onHover?: (card: CardDbo | null) => void,
  viewMode: ViewMode
}

const classNameByViewMode: Record<ViewMode, string> = {
  [ViewMode.TABLE]: "flex items-center text-sm px-2 border-t border-gray-800 py-1",
  [ViewMode.TABLE_CONDENSED]: "flex items-center text-sm px-1 ",
  [ViewMode.VISUAL_GRID]: "relative z-10 -mt-32 h-64",
  [ViewMode.VISUAL_SPOILER]: "relative z-10 h-64",
  [ViewMode.VISUAL_STACK]: "z-10 h-full -mb-80",
  [ViewMode.VISUAL_STACK_SPLIT]: "z-10 h-full  -mb-80",
}

function DeckListCard({ card, quantity, onHover, viewMode }: Props) {
  const { event } = useEvent()
  const [isLegal, setIsLegal] = useState(true)
  const isTextual = [ViewMode.TABLE, ViewMode.TABLE_CONDENSED].includes(viewMode)

  useEffect(() => {
    const legality = card.legalities[event.format]
    if (!legality) return

    if (legality === LegalitiesEnum.RESTRICTED && quantity > 1) {
      setIsLegal(false)
      return
    }
    if ([LegalitiesEnum.BANNED, LegalitiesEnum.NOT_LEGAL].includes(legality)) {
      setIsLegal(false)
      return
    }
  }, [card, quantity, event])

  return (
    <li
      aria-label={card.name}
      className={cn(
        "hover:bg-muted cursor-pointer inline-block",
        classNameByViewMode[viewMode]
      )}
      onMouseEnter={() => onHover?.(card)}
    >
      {isTextual ?
        (
          <>
            <span className="text-muted-foreground">{quantity}</span>
            <span className={cn("ml-2 truncate", !isLegal ? "text-red-500" : "")}>{card.name}</span>
          </>
        ) :
        (
          <img
            src={card.imageMedium}
            alt={card.name}
            className={cn("w-full h-full mx-auto object-cover rounded-xl", !isLegal ? "border-1 border-red-500" : "")}
          />
        )}
    </li>
  )
}

export default DeckListCard