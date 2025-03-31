export enum MTG_COLORS {
  WHITE = 'W',
  BLUE = 'U',
  BLACK = 'B',
  RED = 'R',
  GREEN = 'G',
  COLORLESS = 'C',
}

const WUBRG_ORDER: MTG_COLORS[] = [
  MTG_COLORS.WHITE,
  MTG_COLORS.BLUE,
  MTG_COLORS.BLACK,
  MTG_COLORS.RED,
  MTG_COLORS.GREEN,
]

export function humanReadable(colors: MTG_COLORS[]): string {
  if (colors.length === 0) return "Colorless"

  const sorted = WUBRG_ORDER.filter(c => colors.includes(c)).join("")

  const labels: Record<string, string> = {
    W: "Mono-White",
    U: "Mono-Blue",
    B: "Mono-Black",
    R: "Mono-Red",
    G: "Mono-Green",

    WG: "Selesnya",
    WB: "Orzhov",
    WR: "Boros",
    WU: "Azorius",
    UB: "Dimir",
    UR: "Izzet",
    UG: "Simic",
    BR: "Rakdos",
    BG: "Golgari",
    RG: "Gruul",

    WUB: "Esper",
    WUR: "Jeskai",
    WUG: "Bant",
    WBR: "Mardu",
    WBG: "Abzan",
    WRG: "Naya",
    URG: "Temur",
    UBG: "Sultai",
    UBR: "Grixis",
    BRG: "Jund",

    WUBR: "Glint",
    WUBG: "Witch",
    WURG: "Ink",
    WBRG: "Dune",
    UBRG: "Yore",

    WUBRG: "Five-Color",
  }

  return labels[sorted] ?? `Unknown (${colors.join(", ")})`
}
