import { z } from 'zod'

// ---------------------------------------------------------------------------
// Effect card base — shared identity fields composed by content-type unions.
// ---------------------------------------------------------------------------

export const effectIdSchema = z.string().min(1)

/** Optional distinguisher for roll-bearing effects (e.g. "Clenched Fist"). */
export const effectLabelSchema = z.string().min(1).optional()

/** Author-provided plural noun after projectile count (e.g. "darts", "beams"). */
export const effectUnitLabelSchema = z.string().min(1)

/** Rich-text HTML (TipTap) supplementary prose for an effect card. */
export const effectDescriptionSchema = z.string().optional()

export const effectBaseFields = {
  id: effectIdSchema,
  description: effectDescriptionSchema,
} as const

export const effectBaseSchema = z.object(effectBaseFields)

export type EffectBase = z.infer<typeof effectBaseSchema>
