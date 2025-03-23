type Size = "sm" | "md" | "lg"

export const sizeMap: Record<Size, string> = {
  sm: "w-3 h-3",
  md: "w-6 h-6",
  lg: "w-10 h-10",
}

export type ManaProps = React.SVGProps<SVGSVGElement> & { size?: Size }