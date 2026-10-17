'use client'

import { overlayArrowHeight, overlayArrowPath, overlayArrowWidth } from './popover-content.variants'

export type OverlayArrowSvgProps = {
  /** CSS color for arrow fill (e.g. `var(--popover)` or `var(--surface-lift)`). */
  fill: string
}

/** Shared pointer SVG for popover and tooltip overlays. */
export function OverlayArrowSvg({ fill }: OverlayArrowSvgProps) {
  return (
    <svg
      className="ui-overlay-arrow"
      width={overlayArrowWidth}
      height={overlayArrowHeight}
      viewBox={`0 0 ${overlayArrowWidth} ${overlayArrowHeight}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <rect x="3.5" y="0" width="13" height="3" fill={fill} stroke="none" />
      <path
        d={overlayArrowPath}
        fill={fill}
        stroke="var(--border)"
        strokeWidth={1}
        strokeLinejoin="round"
      />
    </svg>
  )
}

export { overlayArrowHeight, overlayArrowWidth }
