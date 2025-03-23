import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
import { type ManaProps, sizeMap } from "~/resources/ui/components/mana/props"

const SvgU= ({ size = "md", className = "", ...props }: SVGProps<SVGSVGElement> & ManaProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" className={`${sizeMap[size]} ${className}`} {...props}>
    <circle cx={300} cy={300} r={300} fill="#aae0fa" />
    <path
      fill="#061922"
      d="M404.92 502.32q-43.084 43.844-106.13 43.842c-47.17 0-84.59-16.14-112.27-48.44-26.15-30.762-39.22-69.972-39.22-117.64 0-51.26 22.302-109.72 66.9-175.34 36.38-53.814 79.19-100.98 128.41-141.48-7.182 32.814-10.758 56.13-10.758 69.972 0 31.794 9.984 62.802 29.976 93.05 24.612 35.88 43.31 62.56 56.14 79.968 19.992 30.26 29.988 59.73 29.988 88.42q.001 63.836-43.04 107.65m-.774-164.17c-7.686-17.17-16.662-28.572-26.916-34.22 1.536 3.084 2.31 7.44 2.31 13.08 0 10.77-3.072 26.14-9.234 46.13l-9.984 30.762c0 17.94 8.952 26.916 26.904 26.916 18.96 0 28.452-12.57 28.452-37.686 0-12.804-3.84-27.792-11.532-44.988"
    />
  </svg>
);
const Memo = memo(SvgU);
export default Memo;
