import { z } from 'zod'

import { abilitySchema } from '../../../vocab/ability'

export const SAVE_DC_MIN = 1
export const SAVE_DC_MAX = 40
export const DEFAULT_FIXED_SAVE_DC = 15

export const fixedSaveDcSchema = z
  .number()
  .int()
  .min(SAVE_DC_MIN, `Save DC must be at least ${SAVE_DC_MIN}.`)
  .max(SAVE_DC_MAX, `Save DC cannot exceed ${SAVE_DC_MAX}.`)

/** Ability used to calculate a spell save DC, or a shared spellcasting entry. */
export const castingAbilitySchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('ability'), ability: abilitySchema }),
  z.object({ kind: z.literal('shared'), entryId: z.string().min(1) }),
])

export type CastingAbility = z.infer<typeof castingAbilitySchema>

export const savingThrowDcSourceSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('fixed'),
    dc: fixedSaveDcSchema.default(DEFAULT_FIXED_SAVE_DC),
  }),
  z.object({ kind: z.literal('spellcasting'), castingAbility: castingAbilitySchema }),
])

export type SavingThrowDcSource = z.infer<typeof savingThrowDcSourceSchema>

/** Published prose saving throw. Failure and success stay authored text. */
export const savingThrowEffectSchema = z.object({
  ability: abilitySchema,
  dcSource: savingThrowDcSourceSchema,
  targets: z.string().trim().min(1),
  failure: z.string().trim().min(1),
  success: z.preprocess((value) => {
    if (typeof value !== 'string') return value
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : undefined
  }, z.string().min(1).optional()),
})

export type SavingThrowEffect = z.infer<typeof savingThrowEffectSchema>

const draftCastingAbilitySchema = z.object({
  kind: z.enum(['ability', 'shared']).optional(),
  ability: abilitySchema.optional(),
  entryId: z.string().optional(),
})

/** In-progress authoring. Fields stay optional until publish. */
export const savingThrowEffectDraftSchema = z.object({
  ability: abilitySchema.optional(),
  dcSource: z
    .object({
      kind: z.enum(['fixed', 'spellcasting']).optional(),
      dc: fixedSaveDcSchema.optional(),
      castingAbility: draftCastingAbilitySchema.optional(),
    })
    .optional(),
  targets: z.string().optional(),
  failure: z.string().optional(),
  success: z.string().optional(),
})

export type SavingThrowEffectDraft = z.infer<typeof savingThrowEffectDraftSchema>

function trimmedText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function dcSourceStarted(value: unknown): boolean {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) return false
  const source = value as Record<string, unknown>
  return Boolean(source.kind || source.dc != null || source.castingAbility != null)
}

/**
 * Drops a saving throw that has no authored content. A partial draft is kept.
 * Blank success is omitted.
 */
export function omitEmptySavingThrow(value: unknown): unknown {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) return undefined
  const record = { ...(value as Record<string, unknown>) }
  const success = trimmedText(record.success)
  if (success) record.success = success
  else delete record.success
  const hasContent =
    Boolean(record.ability) ||
    dcSourceStarted(record.dcSource) ||
    Boolean(trimmedText(record.targets)) ||
    Boolean(trimmedText(record.failure)) ||
    Boolean(success)
  return hasContent ? record : undefined
}
