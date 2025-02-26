import React from "react"
import { Tooltip } from "@heroui/tooltip"

interface PercentageProps {
  ratio: number,
  precision?: number
  tooltip?: number
}

const Percentage = ({ratio, precision = 2, tooltip = 5}: PercentageProps) => {
  return (
    <Tooltip color="default" showArrow={true} content={
      <span>{(ratio*100).toFixed(tooltip)} %</span>
    } delay={1000}>
      <span>{(ratio * 100).toFixed(precision)} %</span>
    </Tooltip>
  )
}

export default  Percentage