import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
import { type ManaProps, sizeMap } from "~/resources/ui/components/mana/props"

const SvgR= ({ size = "md", className = "", ...props }: SVGProps<SVGSVGElement> & ManaProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" className={`${sizeMap[size]} ${className}`} {...props}>
    <circle cx={300} cy={300} r={300} fill="#f9aa8f" />
    <path
      fill="#200000"
      d="M551.8 399.7c-22.4 53.5-67 80.2-133.6 80.2-12.2 0-25.5 1.5-39.7 4.6-21.4 4.6-32.1 11-32.1 19.1 0 2.5 1.8 5.5 5.3 8.8 3.6 3.3 6.6 5 9.2 5-12.7 0-4.1.4 26 1.1 30.1.8 48.9 1.1 56.5 1.1-44.3 26-118.4 37.9-222.3 35.9-34.1-.5-63.4-15.5-87.8-45.1-24-28-35.9-59.3-35.9-93.9 0-36.6 12.3-67.8 37.1-93.6 24.7-25.7 55.4-38.6 92-38.6 8.1 0 19 1.8 32.5 5.3 13.5 3.6 22.5 5.3 27.1 5.3 18.8 0 42.3-7.8 70.3-23.3s41.3-23.3 39.7-23.3c-5.1 53.5-22.9 89.4-53.5 107.7-21.9 12.7-32.8 25.2-32.8 37.4 0 7.6 4.6 13.8 13.7 18.3q10.65 5.4 23.7 5.4c13.2 0 26.2-8.1 39-24.4 12.7-16.3 18.3-31.1 16.8-44.3-1.5-15.3-.5-33.6 3.1-55q1.5-9.15 11.1-22.5c6.4-8.9 12.1-14.4 17.2-16.4 0 4.6-1.6 12.2-5 22.9-3.3 10.7-5 18.6-5 23.7 0 11.2 3 19.9 9.2 26 9.2-3.6 17.3-15 24.4-34.4 6.1-14.8 9.7-29 10.7-42.8-21.4-1-41.9-10.7-61.5-29s-29.4-38.2-29.4-59.6c0-3.6.5-7.1 1.5-10.7 3 4.6 7.6 11.7 13.7 21.4 8.7 12.7 15.3 19.1 19.9 19.1 6.1 0 9.2-6.4 9.2-19.1 0-16.3-4.3-31.1-13-44.3-9.7-15.8-22.2-23.7-37.4-23.7-7.1 0-17.8 3.8-32.1 11.5-14.3 7.6-27.3 11.5-39 11.5q-5.4 0-47.4-13.8c49.4-8.1 74.1-15.5 74.1-22.1 0-17.3-33.9-29-101.6-35.1-6.6-.5-18.8-1.5-36.7-3.1q3-3.75 43.5-8.4c22.9-2.5 39-3.8 48.1-3.8 121.2 0 198.1 58.8 230.7 176.5 5.6-4.6 8.4-12.4 8.4-23.2 0-13.9-4.1-31.5-12.2-52.7-3.1-8.2-7.9-20.6-14.5-37.2 41.7 53.2 62.6 103.6 62.6 151.2 0 25.1-5.9 47.8-17.6 68.3-7.6 13.8-21.9 31.5-42.8 53s-35.1 38.1-42.8 49.9c28-7.6 46.4-13.5 55-17.6 19.3-8.6 36.9-21.6 52.7-39 0 6.6-2.8 16.6-8.4 29.8M218.8 99.5c0 9.2-5.1 15-15.3 17.6l-19.9 3.1c-7.1 3.6-17.6 17.6-31.3 42q-2.25-11.4-6.9-32.1c-4.6.5-12.2 4.6-22.9 12.2-4.6 3.6-12 8.9-22.2 16 3.1-18.3 13.2-36.9 30.6-55.8 18.3-20.9 36.2-31.3 53.5-31.3 22.9 0 34.4 9.4 34.4 28.3m132.9 70.3c0 8.7-4.7 15.9-14.1 21.8s-18.7 8.8-27.9 8.8c-12.2 0-23.2-6.9-32.8-20.6-11.7-16.8-23.7-27.7-35.9-32.9 2.5-2.5 5.6-3.8 9.2-3.8 4.6 0 12.3 3.6 23.3 10.7 10.9 7.1 17.9 10.7 21 10.7 2.5 0 6.7-3.6 12.6-10.7s12.3-10.7 19.5-10.7q25.2 0 25.2 26.7"
    />
  </svg>
);
const Memo = memo(SvgR);
export default Memo;
