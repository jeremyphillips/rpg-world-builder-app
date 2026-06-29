import { z } from 'zod'

/** `#RRGGBB` hex color for UI badges and swatches. */
export const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a hex color like #6366f1')

export type HexColor = z.infer<typeof hexColorSchema>

export const DEFAULT_EPIC_BADGE_COLOR = '#6366f1'
