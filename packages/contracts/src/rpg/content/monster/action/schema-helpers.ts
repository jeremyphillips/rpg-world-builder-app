import { z } from 'zod'

import { addCustomRefinementIssue } from '../../../../lib/add-custom-refinement-issue'
import { attackOnHitSchema } from '../../../primitives/mechanics/attack-on-hit'
import { limitedUseDraftSchema, limitedUseSchema } from '../../../primitives/limited-use'
import { abilitySchema } from '../../../vocab/ability'
import { damageTypeIdSchema } from '../../../vocab/damage'
import { movementAllowanceSchema } from '../../../vocab/movement-allowance'
import { spellComponentIdSchema } from '../../../vocab/spell/components'
import { reachFeetSchema } from '../../../vocab/attack/melee-reach'
import { weaponModeSchema } from '../../../vocab/weapon'
import { entryProvenanceField } from '../../../primitives/provenance'
import {
  castingAbilitySchema,
  type savingThrowEffectDraftSchema,
  type savingThrowEffectSchema,
} from '../../lib/saving-throw/schema'
import { naturalAttackFormSchema } from '../../../vocab/action/natural-attack-form'
import { spellReferenceSchema } from '../../spell/spell-reference'
import {
  weaponDamageDraftSchema,
  weaponDamageSchema,
  weaponRangeSchema,
} from '../../equipment/weapon-variant'
import { shapeShiftEquipmentSchema } from '../../../vocab/shape-shift-equipment'
import { MONSTER_SECTION_KINDS } from '../action-section-eligibility'
import { PRIMARY_SPELLCASTING_PROFILE } from '../spell-casting-source'
import {
  attackModes,
  attackOnHitDraftSchema,
  multiattackAlternativeDraftSchema,
  multiattackAlternativePublishedSchema,
  multiattackDraftStepSchema,
  multiattackPublishedStepSchema,
  multiattackReplacementDraftSchema,
  multiattackReplacementSchema,
  naturalWeaponPropertySchema,
  type MonsterActionMode,
} from './shared-fragments'
import { ACTION_REFERENCE_CHOOSE_FROM_ACTIONS } from './reference-messages'
import {
  monsterRichTextIsEmpty,
  RULES_OR_SAVING_THROW_MESSAGE,
  saveResolutionSchema,
  savingThrowFieldSchema,
} from './save-refinements'

export function strict<T extends z.ZodType, M extends MonsterActionMode>(
  schema: T,
  mode: M,
): M extends 'draft' ? z.ZodOptional<T> : T {
  return (mode === 'draft' ? schema.optional() : schema) as M extends 'draft' ? z.ZodOptional<T> : T
}

export function multiattackStepsSchema<M extends MonsterActionMode>(mode: M) {
  const draft = z.array(multiattackDraftStepSchema).default([])
  const published = z.array(multiattackPublishedStepSchema).min(1)
  return (mode === 'draft' ? draft : published) as M extends 'draft'
    ? typeof draft
    : typeof published
}

// fallow-ignore-next-line complexity
export function monsterActionFields<M extends MonsterActionMode>(mode: M) {
  const limitedUse = (
    mode === 'draft' ? limitedUseDraftSchema : limitedUseSchema
  ) as M extends 'draft' ? typeof limitedUseDraftSchema : typeof limitedUseSchema
  const onHit = mode === 'draft' ? attackOnHitDraftSchema.optional() : attackOnHitSchema.optional()
  const spellEntrySchema = z.object({
    spellId: mode === 'draft' ? spellReferenceSchema.optional() : spellReferenceSchema,
    castAtLevel: z.number().int().min(0).max(9).optional(),
    limitedUse: limitedUse.optional(),
  })
  const spells =
    mode === 'draft' ? z.array(spellEntrySchema).default([]) : z.array(spellEntrySchema).min(1)
  const savingThrow = savingThrowFieldSchema(mode) as M extends 'draft'
    ? z.ZodOptional<typeof savingThrowEffectDraftSchema>
    : z.ZodOptional<typeof savingThrowEffectSchema>
  const identity = {
    id: z.string().min(1),
    preset: z.string().min(1).optional(),
    description: z.string().optional(),
    limitedUse: limitedUse.optional(),
    onceUntilNextTurn: z.literal(true).optional(),
    available: z.boolean().optional(),
    onlyInFormIds: z.array(z.string().min(1)).optional(),
    ...entryProvenanceField,
  }
  const {
    description: _referenceDescription,
    limitedUse: _referenceLimitedUse,
    ...referenceIdentity
  } = identity
  const {
    onlyInFormIds: _formEligibility,
    onceUntilNextTurn: _turnLimit,
    ...transformIdentity
  } = identity
  const actionIds =
    mode === 'draft'
      ? z.array(z.string().min(1)).default([])
      : z.array(z.string().min(1)).min(1, ACTION_REFERENCE_CHOOSE_FROM_ACTIONS)
  const monsterAbilitySourceSchema = z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('spellcasting'), castingAbility: castingAbilitySchema }),
    z.object({
      kind: z.literal('ability'),
      ability: abilitySchema,
      proficient: z.boolean(),
    }),
  ])

  return [
    z.object({
      ...identity,
      kind: z.literal('weapon'),
      name: z.string().min(1).optional(),
      equipmentEntryId: strict(z.string().min(1), mode),
      damage: (mode === 'draft'
        ? weaponDamageDraftSchema.optional()
        : weaponDamageSchema.optional()) as M extends 'draft'
        ? z.ZodOptional<typeof weaponDamageDraftSchema>
        : z.ZodOptional<typeof weaponDamageSchema>,
      onHit,
    }),
    z.object({
      ...identity,
      kind: z.literal('natural-weapon'),
      name: z.string().min(1).optional(),
      form: naturalAttackFormSchema.optional(),
      mode: strict(weaponModeSchema, mode),
      properties: (mode === 'draft'
        ? z.array(naturalWeaponPropertySchema).optional()
        : z.array(naturalWeaponPropertySchema).default([])) as M extends 'draft'
        ? z.ZodOptional<z.ZodArray<typeof naturalWeaponPropertySchema>>
        : z.ZodDefault<z.ZodArray<typeof naturalWeaponPropertySchema>>,
      reach: reachFeetSchema.optional(),
      range: weaponRangeSchema.optional(),
      damage: (mode === 'draft'
        ? weaponDamageDraftSchema.optional()
        : weaponDamageSchema) as M extends 'draft'
        ? z.ZodOptional<typeof weaponDamageDraftSchema>
        : typeof weaponDamageSchema,
      damageType: strict(damageTypeIdSchema, mode),
      onHit,
    }),
    z.object({
      ...identity,
      kind: z.literal('attack'),
      name: strict(z.string().min(1), mode),
      bonusSource: strict(monsterAbilitySourceSchema, mode),
      modes:
        mode === 'draft'
          ? z.array(z.enum(attackModes)).min(1).optional()
          : z.array(z.enum(attackModes)).min(1),
      reach: reachFeetSchema.optional(),
      range: weaponRangeSchema.optional(),
      damage: (mode === 'draft'
        ? weaponDamageDraftSchema.optional()
        : weaponDamageSchema) as M extends 'draft'
        ? z.ZodOptional<typeof weaponDamageDraftSchema>
        : typeof weaponDamageSchema,
      damageType: strict(damageTypeIdSchema, mode),
      onHit,
    }),
    z
      .object({
        ...identity,
        kind: z.literal('special'),
        name: strict(z.string().min(1), mode),
        description: z.string().optional(),
        savingThrow,
      })
      .superRefine((action, ctx) => {
        if (mode === 'draft') return
        const row = action as { description?: string; savingThrow?: unknown }
        const text = typeof row.description === 'string' ? row.description : ''
        if ((text.length === 0 || monsterRichTextIsEmpty(text)) && row.savingThrow == null) {
          addCustomRefinementIssue(ctx, RULES_OR_SAVING_THROW_MESSAGE, ['description'])
        }
      }),
    z.object({
      ...identity,
      kind: z.literal('spell'),
      name: strict(z.string().min(1), mode),
      profile: z.literal(PRIMARY_SPELLCASTING_PROFILE).optional(),
      castingAbility: strict(castingAbilitySchema, mode),
      spellInvocation: z.literal('use-entry').optional(),
      omittedComponents: z.array(spellComponentIdSchema).optional(),
      spells: strict(spells, mode),
      description: z.string().optional(),
    }),
    z.object({
      ...identity,
      kind: z.literal('save'),
      name: z.string().min(1).optional(),
      dcSource: strict(monsterAbilitySourceSchema, mode),
      resolution: saveResolutionSchema(mode),
    }),
    z.object({
      ...identity,
      kind: z.literal('multiattack'),
      name: z.string().min(1).optional(),
      steps: multiattackStepsSchema(mode),
      replacement:
        mode === 'draft'
          ? multiattackReplacementDraftSchema.optional()
          : multiattackReplacementSchema.optional(),
      alternative:
        mode === 'draft'
          ? multiattackAlternativeDraftSchema.optional()
          : multiattackAlternativePublishedSchema.optional(),
    }),
    z.object({
      ...transformIdentity,
      kind: z.literal('shape-shift'),
      name: z.string().min(1).optional(),
      equipment: strict(shapeShiftEquipmentSchema, mode),
      prerequisite: z.string().trim().min(1).optional(),
    }),
    z.object({
      ...referenceIdentity,
      kind: z.literal('action-reference'),
      name: z.string().min(1).optional(),
      actionIds,
      movement: z
        .object({
          allowance: movementAllowanceSchema,
          withoutOpportunityAttacks: z.literal(true).optional(),
        })
        .optional(),
    }),
  ] as const
}

export function omitActionKinds<T extends { shape: { kind: z.ZodType } }>(
  options: readonly T[],
  kinds: readonly string[],
) {
  return options.filter(
    (option) => !kinds.some((kind) => option.shape.kind.safeParse(kind).success),
  ) as unknown as [T, T, ...T[]]
}

export const publishedActionFields = monsterActionFields('published')
export const draftActionFields = monsterActionFields('draft')

const ACTION_FIELD_KINDS = [
  'weapon',
  'natural-weapon',
  'attack',
  'save',
  'special',
  'spell',
  'multiattack',
  'shape-shift',
  'action-reference',
] as const

export function omittedSectionKinds(section: 'actions' | 'bonusActions' | 'legendaryActions') {
  const allowed = new Set<string>(MONSTER_SECTION_KINDS[section])
  return ACTION_FIELD_KINDS.filter((kind) => !allowed.has(kind))
}
