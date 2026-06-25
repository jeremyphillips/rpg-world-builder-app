import { z } from 'zod'

import { absoluteLevelSchema } from '../primitives/level'
import {
  contentBodyBaseSchema,
  contentMetaSchema,
  contentPatchBaseSchema,
  slugSchema,
} from './envelope'

// ---------------------------------------------------------------------------
// XP progression — authored level thresholds. System records provide the SRD
// default table; campaign content can patch that default or add class-specific
// progressions without changing the primitive level contract.
// ---------------------------------------------------------------------------

export const XP_PROGRESSION_SCOPE_KINDS = ['standard', 'class'] as const

export const xpProgressionScopeKindSchema = z.enum(XP_PROGRESSION_SCOPE_KINDS)

export type XpProgressionScopeKind = z.infer<typeof xpProgressionScopeKindSchema>

export const standardXpProgressionScopeSchema = z
  .object({
    kind: z.literal('standard'),
  })
  .strict()

export const classXpProgressionScopeSchema = z
  .object({
    kind: z.literal('class'),
    /** Opaque class content id this progression applies to. */
    classId: z.string().min(1),
  })
  .strict()

export const xpProgressionScopeSchema = z.discriminatedUnion('kind', [
  standardXpProgressionScopeSchema,
  classXpProgressionScopeSchema,
])

export type XpProgressionScope = z.infer<typeof xpProgressionScopeSchema>

export const xpProgressionEntrySchema = z.object({
  level: absoluteLevelSchema,
  xpRequired: z.number().int().min(0),
})

export type XpProgressionEntry = z.infer<typeof xpProgressionEntrySchema>

export const xpProgressionEntriesSchema = z
  .array(xpProgressionEntrySchema)
  .min(1)
  .superRefine((entries, ctx) => {
    entries.forEach((entry, index) => {
      const expectedLevel = index + 1

      if (entry.level !== expectedLevel) {
        ctx.addIssue({
          code: 'custom',
          message: `XP progression entries must be contiguous from level 1; expected level ${expectedLevel}`,
          path: [index, 'level'],
        })
      }

      if (index === 0 && entry.xpRequired !== 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'Level 1 must require 0 XP',
          path: [index, 'xpRequired'],
        })
      }

      const previousEntry = entries[index - 1]
      if (previousEntry !== undefined && entry.xpRequired <= previousEntry.xpRequired) {
        ctx.addIssue({
          code: 'custom',
          message: 'XP required must increase with each level',
          path: [index, 'xpRequired'],
        })
      }
    })
  })

export type XpProgressionEntries = z.infer<typeof xpProgressionEntriesSchema>

/** The editable shape: what a form authors and what a patch overrides. */
export const xpProgressionBodySchema = contentBodyBaseSchema.extend({
  scope: xpProgressionScopeSchema,
  entries: xpProgressionEntriesSchema,
})

export type XpProgressionBody = z.infer<typeof xpProgressionBodySchema>

/** Stored shape = ownership envelope + body. */
export const xpProgressionSchema = contentMetaSchema.extend(xpProgressionBodySchema.shape)
export type XpProgression = z.infer<typeof xpProgressionSchema>

export const createXpProgressionInputSchema = xpProgressionBodySchema.extend({ slug: slugSchema })
export type CreateXpProgressionInput = z.infer<typeof createXpProgressionInputSchema>

export const updateXpProgressionInputSchema = createXpProgressionInputSchema.partial()
export type UpdateXpProgressionInput = z.infer<typeof updateXpProgressionInputSchema>

export const xpProgressionPatchSchema = contentPatchBaseSchema.extend({
  patch: xpProgressionBodySchema.partial(),
})
export type XpProgressionPatch = z.infer<typeof xpProgressionPatchSchema>

export function xpRequiredForLevel(
  progression: Pick<XpProgressionBody, 'entries'>,
  level: number,
): number | undefined {
  return progression.entries.find((entry) => entry.level === level)?.xpRequired
}
