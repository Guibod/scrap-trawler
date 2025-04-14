import { type PlasmoCSUIContainerProps } from "plasmo"
import React from "react"

/**
 * OverlayRelativeCSUIContainer
 *
 * A very simplified implementation of a PlasmoCSUIContainer component (ignores indexes z-indexes, relative etc.)
 * @param props
 * @constructor
 */
export const OverlayRelativeToShadowHostCSUIContainer = (props: PlasmoCSUIContainerProps) => {
  return (
    <div
      id={props.id}
      className="plasmo-csui-container"
    >
      {props.children}
    </div>
  )
}