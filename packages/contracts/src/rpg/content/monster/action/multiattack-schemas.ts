import { z } from 'zod'

const multiattackReplacementChoiceSchema = z.object({
  actionId: z.string().min(1),
  spellId: z.string().min(1).optional(),
})

const multiattackReplacementChoiceDraftSchema = z.object({
  actionId: z.string().optional(),
  spellId: z.string().min(1).optional(),
})

export const multiattackReplacementSchema = z
  .object({
    count: z.number().int().min(1),
    choices: z.array(multiattackReplacementChoiceSchema).min(1),
    replacesActionId: z.string().min(1).optional(),
    attackWord: z.literal('any').optional(),
    whenAvailable: z.literal(true).optional(),
  })
  .strict()

export const multiattackReplacementDraftSchema = z
  .object({
    count: z.number().int().min(1).optional(),
    choices: z.array(multiattackReplacementChoiceDraftSchema).default([]),
    replacesActionId: z.string().min(1).optional(),
    attackWord: z.literal('any').optional(),
    whenAvailable: z.literal(true).optional(),
  })
  .strict()

export const multiattackUseChoiceRowSchema = z.object({
  actionId: z.string().min(1),
  spellId: z.string().min(1).optional(),
})

export const multiattackUseChoiceRowDraftSchema = z.object({
  actionId: z.string().optional(),
  spellId: z.string().min(1).optional(),
})

export const multiattackUseSinglePublishedSchema = z
  .object({
    kind: z.literal('use'),
    mode: z.literal('single'),
    actionId: z.string().min(1),
    count: z.number().int().min(1).optional(),
    spellId: z.string().min(1).optional(),
    optional: z.literal(true).optional(),
    whenAvailable: z.literal(true).optional(),
  })
  .strict()

export const multiattackUseSingleDraftSchema = z
  .object({
    kind: z.literal('use'),
    mode: z.literal('single').optional(),
    actionId: z.string().optional(),
    count: z.number().int().min(1).optional(),
    spellId: z.string().min(1).optional(),
    optional: z.literal(true).optional(),
    whenAvailable: z.literal(true).optional(),
  })
  .strict()

export const multiattackUseChoicePublishedSchema = z
  .object({
    kind: z.literal('use'),
    mode: z.literal('choice'),
    choices: z.array(multiattackUseChoiceRowSchema).min(1),
    whenAvailable: z.literal(true).optional(),
  })
  .strict()

export const multiattackUseChoiceDraftSchema = z
  .object({
    kind: z.literal('use'),
    mode: z.literal('choice').optional(),
    choices: z.array(multiattackUseChoiceRowDraftSchema).default([]),
    whenAvailable: z.literal(true).optional(),
  })
  .strict()

export const multiattackAttackGroupPublishedSchema = z.object({
  count: z.number().int().min(1),
  actionIds: z.array(z.string().min(1)).min(1),
})

export const multiattackAttackGroupDraftSchema = z.object({
  count: z.number().int().min(1).optional(),
  actionIds: z.array(z.string().min(1)).default([]),
})

export const multiattackPublishedStepSchema = z.union([
  multiattackAttackGroupPublishedSchema,
  multiattackUseSinglePublishedSchema,
  multiattackUseChoicePublishedSchema,
])

export const multiattackDraftStepSchema = z.union([
  multiattackAttackGroupDraftSchema,
  multiattackUseSingleDraftSchema,
  multiattackUseChoiceDraftSchema,
])

export const multiattackAlternativePublishedSchema = z.object({
  steps: z.array(multiattackPublishedStepSchema).min(1),
  afterUsingActionId: z.string().min(1).optional(),
})

export const multiattackAlternativeDraftSchema = z.object({
  steps: z.array(multiattackDraftStepSchema).default([]),
  afterUsingActionId: z.string().min(1).optional(),
})

export type MultiattackAttackGroup = z.infer<typeof multiattackAttackGroupPublishedSchema>
export type MultiattackUseSingle = z.infer<typeof multiattackUseSinglePublishedSchema>
export type MultiattackUseChoice = z.infer<typeof multiattackUseChoicePublishedSchema>
export type MultiattackPublishedStep = z.infer<typeof multiattackPublishedStepSchema>
export type MultiattackDraftStep = z.infer<typeof multiattackDraftStepSchema>
export type MultiattackReplacement = z.infer<typeof multiattackReplacementSchema>
export type MultiattackAlternative = z.infer<typeof multiattackAlternativePublishedSchema>

/** Whole positive integers for multiattack counts in validation, normalization, and prose. */
export function multiattackPositiveInt(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isInteger(value) && value >= 1) return value
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return undefined
    const parsed = Number(trimmed)
    if (Number.isInteger(parsed) && parsed >= 1) return parsed
  }
  return undefined
}

export function isMultiattackAttackGroup(step: {
  kind?: string
  actionIds?: unknown
}): step is MultiattackAttackGroup {
  return step.kind !== 'use' && Array.isArray(step.actionIds)
}

export function isMultiattackUseClause(step: {
  kind?: string
  actionIds?: unknown
}): step is MultiattackUseSingle | MultiattackUseChoice {
  return step.kind === 'use'
}
