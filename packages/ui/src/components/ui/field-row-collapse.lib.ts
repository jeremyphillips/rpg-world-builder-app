import type { FieldWidth } from './field-control.variants'
import { FIELD_WIDTH_FIXED_TRACKS, isFieldWidthFraction } from './field-row-column-tracks.lib'

/** Horizontal gap between anatomy-row columns — matches Tailwind `gap-6` / `gap-4`. */
export const FIELD_ROW_GAP_PX = {
  form: 24,
  compact: 16,
} as const satisfies Record<'form' | 'compact', number>

/** Minimum comfortable width for a flexible (`full` / fraction) track before the row collapses. */
export const FIELD_ROW_MIN_FLEX_TRACK_PX = 140

/** Conservative intrinsic minimum for `auto` width tokens. */
export const FIELD_ROW_MIN_AUTO_TRACK_PX = 80

/**
 * Derives the container-query collapse threshold for an anatomy row from its width
 * tokens and inter-control gap. Sum of fixed/auto minima + one minimum per flexible
 * track + column gaps.
 */
export function resolveFieldRowCollapseMinWidth(
  widths: readonly FieldWidth[],
  gap: keyof typeof FIELD_ROW_GAP_PX = 'form',
): number {
  if (widths.length <= 1) return 0

  const gapPx = FIELD_ROW_GAP_PX[gap]
  let fixedSum = 0
  let flexTracks = 0

  for (const width of widths) {
    if (width in FIELD_WIDTH_FIXED_TRACKS) {
      const rem = Number.parseFloat(
        FIELD_WIDTH_FIXED_TRACKS[width as keyof typeof FIELD_WIDTH_FIXED_TRACKS],
      )
      fixedSum += rem * 16
      continue
    }
    if (width === 'auto') {
      fixedSum += FIELD_ROW_MIN_AUTO_TRACK_PX
      continue
    }
    if (width === 'full' || isFieldWidthFraction(width)) {
      flexTracks += 1
    }
  }

  const totalGaps = (widths.length - 1) * gapPx
  return Math.ceil(fixedSum + totalGaps + flexTracks * FIELD_ROW_MIN_FLEX_TRACK_PX)
}
