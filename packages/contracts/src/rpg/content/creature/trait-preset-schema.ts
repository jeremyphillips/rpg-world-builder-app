import { z } from 'zod'

import { addCustomRefinementIssue } from '../../../lib/add-custom-refinement-issue'
import { entryProvenanceField } from '../../primitives/provenance'
import {
  CREATURE_TRAIT_VOCABULARY_IDS,
  type CreatureTraitVocabularyId,
} from '../../vocab/creature/trait-vocabulary'
import { CONFIGURABLE_CREATURE_TRAIT_PRESET_IDS } from './trait-presets'
import {
  CREATURE_TRAIT_DURATION_HOUR_MAX,
  CREATURE_TRAIT_DURATION_MINUTE_MAX,
  CREATURE_TRAIT_DURATION_UNITS,
  creatureTraitDurationInBounds,
  normalizeCreatureTraitDuration,
  type CreatureTraitDurationUnit,
} from './trait-duration'

const configurableIds = new Set<string>(CONFIGURABLE_CREATURE_TRAIT_PRESET_IDS)

export const FIXED_CREATURE_TRAIT_PRESET_IDS = CREATURE_TRAIT_VOCABULARY_IDS.filter(
  (id) => !configurableIds.has(id),
) as [CreatureTraitVocabularyId, ...CreatureTraitVocabularyId[]]

export const REGENERATION_TRAIT_PRESET_FAMILY = ['regeneration', 'regeneration-halt'] as const

const idField = { id: z.string().min(1) }

const fixedPresetSchema = z.object({
  ...idField,
  preset: z.enum(FIXED_CREATURE_TRAIT_PRESET_IDS),
  ...entryProvenanceField,
})

const usesField = z.number().int().min(1).max(12)
const radiusField = z.number().int().min(5).max(120)
const longJumpField = z.number().int().min(5).max(60)
const hitPointsField = z.number().int().min(1).max(30)
const durationUnitField = z.enum(CREATURE_TRAIT_DURATION_UNITS)

function durationPairSchema(required: boolean) {
  const count = z.number().int().min(1).max(CREATURE_TRAIT_DURATION_MINUTE_MAX)
  const unit = durationUnitField
  return {
    count: required ? count : count.optional(),
    unit: required ? unit : unit.optional(),
  }
}

function normalizeDurationRow(value: unknown, countKey: string, unitKey: string): unknown {
  if (!value || typeof value !== 'object') return value
  const row = value as Record<string, unknown>
  const count = row[countKey]
  const unit = row[unitKey]
  if (typeof count !== 'number' || (unit !== 'minute' && unit !== 'hour')) return value
  const normalized = normalizeCreatureTraitDuration(count, unit)
  return { ...row, [countKey]: normalized.count, [unitKey]: normalized.unit }
}

function normalizePresetTraitInput(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value
  const row = value as Record<string, unknown>
  if (row.preset === 'hold-breath') return normalizeDurationRow(value, 'count', 'unit')
  if (row.preset === 'water-breathing') {
    return normalizeDurationRow(value, 'outsideWaterBreathAmount', 'outsideWaterBreathUnit')
  }
  return value
}

function refineDuration(
  count: number | undefined,
  unit: CreatureTraitDurationUnit | undefined,
  ctx: z.RefinementCtx,
  countPath: string,
): void {
  if (count === undefined || unit === undefined) return
  if (!creatureTraitDurationInBounds(count, unit)) {
    addCustomRefinementIssue(ctx, 'Duration is outside the supported range.', [countPath])
    return
  }
  if (unit === 'hour' && count > CREATURE_TRAIT_DURATION_HOUR_MAX) {
    addCustomRefinementIssue(ctx, 'Duration is outside the supported range.', [countPath])
  }
}

const legendaryResistanceSchema = z.object({
  ...idField,
  preset: z.literal('legendary-resistance'),
  uses: usesField,
  lair: z.boolean().default(false),
  ...entryProvenanceField,
})

const holdBreathSchema = z
  .object({
    ...idField,
    preset: z.literal('hold-breath'),
    ...durationPairSchema(true),
    ...entryProvenanceField,
  })
  .superRefine((row, ctx) => refineDuration(row.count, row.unit, ctx, 'count'))

const illuminationSchema = z.object({
  ...idField,
  preset: z.literal('illumination'),
  radius: radiusField,
  ...entryProvenanceField,
})

const standingLeapSchema = z.object({
  ...idField,
  preset: z.literal('standing-leap'),
  longJump: longJumpField,
  ...entryProvenanceField,
})

const swarmSchema = z.object({
  ...idField,
  preset: z.literal('swarm'),
  noun: z.string().trim().min(1),
  ...entryProvenanceField,
})

const regenerationSchema = z.object({
  ...idField,
  preset: z.literal('regeneration'),
  hitPoints: hitPointsField,
  ...entryProvenanceField,
})

const regenerationHaltSchema = z.object({
  ...idField,
  preset: z.literal('regeneration-halt'),
  hitPoints: hitPointsField,
  ...entryProvenanceField,
})

const waterBreathingSchema = z
  .object({
    ...idField,
    preset: z.literal('water-breathing'),
    outsideWaterBreathAmount: z
      .number()
      .int()
      .min(1)
      .max(CREATURE_TRAIT_DURATION_MINUTE_MAX)
      .optional(),
    outsideWaterBreathUnit: durationUnitField.optional(),
    ...entryProvenanceField,
  })
  .superRefine((row, ctx) => {
    const hasAmount = row.outsideWaterBreathAmount !== undefined
    const hasUnit = row.outsideWaterBreathUnit !== undefined
    if (hasAmount !== hasUnit) {
      addCustomRefinementIssue(ctx, 'Breath-holding duration needs both an amount and a unit.', [
        hasAmount ? 'outsideWaterBreathUnit' : 'outsideWaterBreathAmount',
      ])
      return
    }
    refineDuration(
      row.outsideWaterBreathAmount,
      row.outsideWaterBreathUnit,
      ctx,
      'outsideWaterBreathAmount',
    )
  })

export const monsterPresetTraitSchema = z.preprocess(
  normalizePresetTraitInput,
  z.union([
    fixedPresetSchema,
    legendaryResistanceSchema,
    holdBreathSchema,
    illuminationSchema,
    standingLeapSchema,
    swarmSchema,
    regenerationSchema,
    regenerationHaltSchema,
    waterBreathingSchema,
  ]),
)

const legendaryResistanceDraftSchema = z.object({
  ...idField,
  preset: z.literal('legendary-resistance'),
  uses: usesField.optional(),
  lair: z.boolean().optional(),
  ...entryProvenanceField,
})

const holdBreathDraftSchema = z.object({
  ...idField,
  preset: z.literal('hold-breath'),
  ...durationPairSchema(false),
  ...entryProvenanceField,
})

const illuminationDraftSchema = z.object({
  ...idField,
  preset: z.literal('illumination'),
  radius: radiusField.optional(),
  ...entryProvenanceField,
})

const standingLeapDraftSchema = z.object({
  ...idField,
  preset: z.literal('standing-leap'),
  longJump: longJumpField.optional(),
  ...entryProvenanceField,
})

const swarmDraftSchema = z.object({
  ...idField,
  preset: z.literal('swarm'),
  noun: z.string().optional(),
  ...entryProvenanceField,
})

const regenerationDraftSchema = z.object({
  ...idField,
  preset: z.literal('regeneration'),
  hitPoints: hitPointsField.optional(),
  ...entryProvenanceField,
})

const regenerationHaltDraftSchema = z.object({
  ...idField,
  preset: z.literal('regeneration-halt'),
  hitPoints: hitPointsField.optional(),
  ...entryProvenanceField,
})

const waterBreathingDraftSchema = z.object({
  ...idField,
  preset: z.literal('water-breathing'),
  outsideWaterBreathAmount: z.number().optional(),
  outsideWaterBreathUnit: z.string().optional(),
  ...entryProvenanceField,
})

export const monsterPresetTraitDraftSchema = z.union([
  fixedPresetSchema,
  legendaryResistanceDraftSchema,
  holdBreathDraftSchema,
  illuminationDraftSchema,
  standingLeapDraftSchema,
  swarmDraftSchema,
  regenerationDraftSchema,
  regenerationHaltDraftSchema,
  waterBreathingDraftSchema,
])
