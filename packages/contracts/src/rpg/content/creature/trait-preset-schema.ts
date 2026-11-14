import { z } from 'zod'

import { addCustomRefinementIssue } from '../../../lib/add-custom-refinement-issue'
import { entryProvenanceField } from '../../primitives/provenance'
import {
  CREATURE_TRAIT_VOCABULARY_IDS,
  type CreatureTraitVocabularyId,
} from '../../vocab/creature/trait-vocabulary'
import { damageTypeIdSchema } from '../../vocab/damage/vocabulary'
import { DEFAULT_FIXED_SAVE_DC, fixedSaveDcSchema } from '../lib/saving-throw/schema'
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

const idField = { id: z.string().min(1) }

const fixedPresetSchema = z.object({
  ...idField,
  preset: z.enum(FIXED_CREATURE_TRAIT_PRESET_IDS),
  ...entryProvenanceField,
})

function rangedNumber(label: string, min: number, max: number) {
  return z
    .number({
      error: () => `${label} is required.`,
    })
    .int()
    .min(min, `${label} must be at least ${min}.`)
    .max(max, `${label} cannot exceed ${max}.`)
}

const usesField = rangedNumber('Uses', 1, 12)
const brightRadiusField = rangedNumber('Bright radius', 5, 120)
const emanationRadiusField = rangedNumber('Emanation radius', 5, 120)
const insightDcField = rangedNumber('Insight DC', 1, 30)
const stenchDcField = fixedSaveDcSchema.default(DEFAULT_FIXED_SAVE_DC)
const attackScopeField = z.enum(['any', 'melee'])
const etherealDirectionField = z.enum(['material-to-ethereal', 'both'])
const mimicrySoundsField = z.enum(
  ['animal-and-humanoid', 'simple-heard'],
  'Choose which sounds it can mimic.',
)
const airFormSpaceField = z.enum(['creature', 'enemy'], 'Choose a space.')
const elementalPlaneField = z.enum(['air', 'fire'])
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
  if (row.preset === 'regeneration') {
    return {
      regeneratesAtZeroHp: false,
      interruptedByDamageTypes: [],
      ...row,
    }
  }
  if (row.preset === 'berserk') return { canBeCalmed: false, ...row }
  if (row.preset === 'stench') return { successImmunity: false, ...row }
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
  radius: brightRadiusField,
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
  regeneratesAtZeroHp: z.boolean(),
  interruptedByDamageTypes: z.array(damageTypeIdSchema),
  ...entryProvenanceField,
})

const bloodiedFurySchema = z.object({
  ...idField,
  preset: z.literal('bloodied-fury'),
  attackScope: attackScopeField,
  ...entryProvenanceField,
})

const etherealSightSchema = z.object({
  ...idField,
  preset: z.literal('ethereal-sight'),
  direction: etherealDirectionField,
  ...entryProvenanceField,
})

const mimicrySchema = z.object({
  ...idField,
  preset: z.literal('mimicry'),
  sounds: mimicrySoundsField,
  insightDc: insightDcField,
  ...entryProvenanceField,
})

const airFormSchema = z.object({
  ...idField,
  preset: z.literal('air-form'),
  space: airFormSpaceField,
  ...entryProvenanceField,
})

const berserkSchema = z.object({
  ...idField,
  preset: z.literal('berserk'),
  canBeCalmed: z.boolean(),
  ...entryProvenanceField,
})

const elementalRestorationSchema = z.object({
  ...idField,
  preset: z.literal('elemental-restoration'),
  element: elementalPlaneField,
  ...entryProvenanceField,
})

const stenchSchema = z.object({
  ...idField,
  preset: z.literal('stench'),
  dc: stenchDcField,
  radius: emanationRadiusField,
  successImmunity: z.boolean(),
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

const monsterPresetTraitUnionSchema = z.union([
  fixedPresetSchema,
  legendaryResistanceSchema,
  holdBreathSchema,
  illuminationSchema,
  standingLeapSchema,
  swarmSchema,
  regenerationSchema,
  waterBreathingSchema,
  bloodiedFurySchema,
  etherealSightSchema,
  mimicrySchema,
  airFormSchema,
  berserkSchema,
  elementalRestorationSchema,
  stenchSchema,
])

export type MonsterPresetTrait = z.infer<typeof monsterPresetTraitUnionSchema>

export const monsterPresetTraitSchema = z.preprocess(
  normalizePresetTraitInput,
  monsterPresetTraitUnionSchema,
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
  radius: brightRadiusField.optional(),
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
  regeneratesAtZeroHp: z.boolean().optional(),
  interruptedByDamageTypes: z.array(damageTypeIdSchema).optional(),
  ...entryProvenanceField,
})

const bloodiedFuryDraftSchema = z.object({
  ...idField,
  preset: z.literal('bloodied-fury'),
  attackScope: attackScopeField.optional(),
  ...entryProvenanceField,
})

const etherealSightDraftSchema = z.object({
  ...idField,
  preset: z.literal('ethereal-sight'),
  direction: etherealDirectionField.optional(),
  ...entryProvenanceField,
})

const mimicryDraftSchema = z.object({
  ...idField,
  preset: z.literal('mimicry'),
  sounds: mimicrySoundsField.optional(),
  insightDc: z.number().optional(),
  ...entryProvenanceField,
})

const airFormDraftSchema = z.object({
  ...idField,
  preset: z.literal('air-form'),
  space: airFormSpaceField.optional(),
  ...entryProvenanceField,
})

const berserkDraftSchema = z.object({
  ...idField,
  preset: z.literal('berserk'),
  canBeCalmed: z.boolean().optional(),
  ...entryProvenanceField,
})

const elementalRestorationDraftSchema = z.object({
  ...idField,
  preset: z.literal('elemental-restoration'),
  element: elementalPlaneField.optional(),
  ...entryProvenanceField,
})

const stenchDraftSchema = z.object({
  ...idField,
  preset: z.literal('stench'),
  dc: fixedSaveDcSchema.optional(),
  radius: z.number().optional(),
  successImmunity: z.boolean().optional(),
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
  waterBreathingDraftSchema,
  bloodiedFuryDraftSchema,
  etherealSightDraftSchema,
  mimicryDraftSchema,
  airFormDraftSchema,
  berserkDraftSchema,
  elementalRestorationDraftSchema,
  stenchDraftSchema,
])
