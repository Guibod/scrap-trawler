import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
import { type ManaProps, sizeMap } from "~/resources/ui/components/mana/props"

const SvgC= ({ size = "md", className = "", ...props }: SVGProps<SVGSVGElement> & ManaProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" className={`${sizeMap[size]} ${className}`} {...props}>
    <circle cx={300} cy={300} r={300} fill="#ccc2c0" />
    <path
      fill="#130c0e"
      d="M300 60a500 500 0 0 0 240 240 500 500 0 0 0-240 240A500 500 0 0 0 60 300 500 500 0 0 0 300 60m0 90a300 300 0 0 1-150 150 300 300 0 0 1 150 150 300 300 0 0 1 150-150 300 300 0 0 1-150-150"
    />
  </svg>
);
const Memo = memo(SvgC);
export default Memo;
