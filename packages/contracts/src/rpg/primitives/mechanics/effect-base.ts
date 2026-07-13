import { z } from 'zod'

// ---------------------------------------------------------------------------
// Effect card base — shared identity fields composed by content-type unions.
// ---------------------------------------------------------------------------

export const effectIdSchema = z.string().min(1)

export const effectLabelSchema = z.string().optional()

/** Rich-text HTML (TipTap) supplementary prose for an effect card. */
export const effectDescriptionSchema = z.string().optional()

export const effectBaseFields = {
  id: effectIdSchema,
  label: effectLabelSchema,
  description: effectDescriptionSchema,
} as const

export const effectBaseSchema = z.object(effectBaseFields)

export type EffectBase = z.infer<typeof effectBaseSchema>
