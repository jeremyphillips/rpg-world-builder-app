import { z } from 'zod'

import { overlayAtomic } from '../../lib/system-overlay/annotate'
import { overlayOrderedList, overlaySlugList } from '../../lib/system-overlay/overlay-presets'

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
    choices: overlaySlugList(multiattackReplacementChoiceSchema).min(1),
    replacesActionId: z.string().min(1).optional(),
    attackWord: z.literal('any').optional(),
  })
  .strict()

export const multiattackReplacementDraftSchema = z
  .object({
    count: z.number().int().min(1).optional(),
    choices: overlaySlugList(multiattackReplacementChoiceDraftSchema).default([]),
    replacesActionId: z.string().min(1).optional(),
    attackWord: z.literal('any').optional(),
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
  })
  .strict()

export const multiattackUseChoicePublishedSchema = z
  .object({
    kind: z.literal('use'),
    mode: z.literal('choice'),
    choices: overlaySlugList(multiattackUseChoiceRowSchema).min(1),
  })
  .strict()

export const multiattackUseChoiceDraftSchema = z
  .object({
    kind: z.literal('use'),
    mode: z.literal('choice').optional(),
    choices: overlaySlugList(multiattackUseChoiceRowDraftSchema).default([]),
  })
  .strict()

export const multiattackAttackGroupPublishedSchema = z.object({
  count: z.number().int().min(1),
  actionIds: overlaySlugList(z.string().min(1)).min(1),
})

export const multiattackAttackGroupDraftSchema = z
  .object({
    count: z.number().int().min(1).optional(),
    actionIds: overlaySlugList(z.string().min(1)).default([]),
    kind: z.literal('use').optional(),
    actionId: z.string().optional(),
    mode: z.literal('choice').optional(),
    choices: z.array(z.unknown()).optional(),
  })
  .refine(
    (step) =>
      step.kind !== 'use' &&
      !(typeof step.actionId === 'string' && step.actionId.trim().length > 0) &&
      step.mode !== 'choice' &&
      !(Array.isArray(step.choices) && step.choices.length > 0),
    { message: 'Use steps are not attack groups.' },
  )

export const multiattackPublishedStepSchema = overlayAtomic(
  z.union([
    multiattackUseSinglePublishedSchema,
    multiattackUseChoicePublishedSchema,
    multiattackAttackGroupPublishedSchema,
  ]),
  'multiattack step clause',
)

export const multiattackDraftStepSchema = overlayAtomic(
  z.union([
    multiattackUseSingleDraftSchema,
    multiattackUseChoiceDraftSchema,
    multiattackAttackGroupDraftSchema,
  ]),
  'multiattack step clause',
)

export const multiattackAlternativePublishedSchema = z.object({
  steps: overlayOrderedList(multiattackPublishedStepSchema).min(1),
  afterUsingActionId: z.string().min(1).optional(),
})

export const multiattackAlternativeDraftSchema = z.object({
  steps: overlayOrderedList(multiattackDraftStepSchema).default([]),
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

function multiattackStepHasUseActionId(step: { actionId?: unknown }): boolean {
  return typeof step.actionId === 'string' && step.actionId.trim().length > 0
}

/** Draft or published step that performs another action (not an attack group row). */
export function isMultiattackUseClause(step: {
  kind?: string
  actionIds?: unknown
  actionId?: unknown
  mode?: string
  choices?: unknown
}): step is MultiattackUseSingle | MultiattackUseChoice {
  if (step.kind === 'use') return true
  if (multiattackStepHasUseActionId(step)) return true
  if (step.mode === 'choice') return true
  if (Array.isArray(step.choices) && step.choices.length > 0) return true
  return false
}

export function isMultiattackAttackGroup(step: {
  kind?: string
  actionIds?: unknown
  actionId?: unknown
  mode?: string
  choices?: unknown
}): step is MultiattackAttackGroup {
  if (isMultiattackUseClause(step)) return false
  return Array.isArray(step.actionIds)
}
