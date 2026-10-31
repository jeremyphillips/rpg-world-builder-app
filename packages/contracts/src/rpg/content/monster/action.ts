import { z } from 'zod'

import { addCustomRefinementIssue } from '../../../lib/add-custom-refinement-issue'
import { activationTriggerSchema } from '../../primitives/activation-trigger'
import { attackOnHitSchema } from '../../primitives/mechanics/attack-on-hit'
import { limitedUseDraftSchema, limitedUseSchema } from '../../primitives/limited-use'
import { abilitySchema } from '../../vocab/ability'
import { damageTypeIdSchema } from '../../vocab/damage'
import { spellComponentIdSchema } from '../../vocab/spell/components'
import { weaponModeSchema } from '../../vocab/weapon'
import { entryProvenanceField } from '../../primitives/provenance'
import { spellReferenceSchema } from '../spell/spell-reference'
import {
  weaponDamageDraftSchema,
  weaponDamageSchema,
  weaponRangeSchema,
} from '../equipment/weapon-variant'

export const NATURAL_WEAPON_PROPERTIES = ['finesse'] as const

const naturalWeaponPropertySchema = z.enum(NATURAL_WEAPON_PROPERTIES)

type MonsterActionMode = 'published' | 'draft'

function strict<T extends z.ZodType, M extends MonsterActionMode>(
  schema: T,
  mode: M,
): M extends 'draft' ? z.ZodOptional<T> : T {
  return (mode === 'draft' ? schema.optional() : schema) as M extends 'draft' ? z.ZodOptional<T> : T
}

const attackModes = ['melee', 'ranged'] as const

const draftDamagePartSchema = z.object({
  roll: weaponDamageDraftSchema.optional(),
  damageType: damageTypeIdSchema.optional(),
})

const attackOnHitDraftSchema = z.object({
  additionalDamage: z.array(draftDamagePartSchema).optional(),
})

function monsterActionFields<M extends MonsterActionMode>(mode: M) {
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
  const castingAbilitySchema = z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('ability'), ability: abilitySchema }),
    z.object({ kind: z.literal('shared'), entryId: z.string().min(1) }),
  ])
  const identity = {
    id: z.string().min(1),
    description: z.string().optional(),
    limitedUse: limitedUse.optional(),
    ...entryProvenanceField,
  }
  const attackBonusSourceSchema = z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('spell'), castingAbility: castingAbilitySchema }),
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
      name: strict(z.string().min(1), mode),
      mode: strict(weaponModeSchema, mode),
      properties: (mode === 'draft'
        ? z.array(naturalWeaponPropertySchema).optional()
        : z.array(naturalWeaponPropertySchema).default([])) as M extends 'draft'
        ? z.ZodOptional<z.ZodArray<typeof naturalWeaponPropertySchema>>
        : z.ZodDefault<z.ZodArray<typeof naturalWeaponPropertySchema>>,
      reach: z.number().int().min(5).optional(),
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
      bonusSource: strict(attackBonusSourceSchema, mode),
      modes:
        mode === 'draft'
          ? z.array(z.enum(attackModes)).min(1).optional()
          : z.array(z.enum(attackModes)).min(1),
      reach: z.number().int().min(5).optional(),
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
      kind: z.literal('special'),
      name: strict(z.string().min(1), mode),
      description: strict(z.string().min(1), mode),
    }),
    z.object({
      ...identity,
      kind: z.literal('spell'),
      name: strict(z.string().min(1), mode),
      castingAbility: strict(castingAbilitySchema, mode),
      omittedComponents: z.array(spellComponentIdSchema).optional(),
      spells: strict(spells, mode),
      description: z.string().optional(),
    }),
  ] as const
}

export const monsterActionSchema = z.discriminatedUnion('kind', [
  ...monsterActionFields('published'),
])

const reactionTriggerField = { trigger: activationTriggerSchema.optional() } as const

export const monsterReactionSchema = z.discriminatedUnion('kind', [
  monsterActionSchema.options[0].extend(reactionTriggerField),
  monsterActionSchema.options[1].extend(reactionTriggerField),
  monsterActionSchema.options[2].extend(reactionTriggerField),
  monsterActionSchema.options[3].extend(reactionTriggerField),
  monsterActionSchema.options[4].extend(reactionTriggerField),
])

export type MonsterAction = z.infer<typeof monsterActionSchema>
export type MonsterReaction = z.infer<typeof monsterReactionSchema>

export const monsterActionDraftSchema = z.discriminatedUnion('kind', [
  ...monsterActionFields('draft'),
])

export const monsterReactionDraftSchema = z.discriminatedUnion('kind', [
  monsterActionDraftSchema.options[0].extend(reactionTriggerField),
  monsterActionDraftSchema.options[1].extend(reactionTriggerField),
  monsterActionDraftSchema.options[2].extend(reactionTriggerField),
  monsterActionDraftSchema.options[3].extend(reactionTriggerField),
  monsterActionDraftSchema.options[4].extend(reactionTriggerField),
])

export type MonsterActionDraft = z.infer<typeof monsterActionDraftSchema>
export type MonsterReactionDraft = z.infer<typeof monsterReactionDraftSchema>

type SpellEntryLike = {
  id: string
  kind: string
  name?: string
  limitedUse?: unknown
  castingAbility?: { kind: string; entryId?: string }
  spells?: readonly { spellId?: string; limitedUse?: unknown }[]
}

export function refineMonsterSpellEntries(
  sections: {
    actions?: readonly SpellEntryLike[]
    bonusActions?: readonly SpellEntryLike[]
    reactions?: readonly SpellEntryLike[]
  },
  ctx: z.RefinementCtx,
  prefix: (string | number)[] = [],
): void {
  const located = (['actions', 'bonusActions', 'reactions'] as const).flatMap((section) =>
    (sections[section] ?? []).map((action, index) => ({ section, index, action })),
  )
  const spellsById = new Map(
    located
      .filter((entry) => entry.action.kind === 'spell')
      .map((entry) => [entry.action.id, entry.action]),
  )

  for (const locatedEntry of located) {
    refineOneSpellEntry(locatedEntry, spellsById, ctx, prefix)
  }
}

function refineOneSpellEntry(
  locatedEntry: { section: string; index: number; action: SpellEntryLike },
  spellsById: ReadonlyMap<string, SpellEntryLike>,
  ctx: z.RefinementCtx,
  prefix: (string | number)[],
): void {
  const { section, index, action } = locatedEntry
  if (action.kind !== 'spell') return
  const path = [...prefix, section, index]
  refineSpellOwnership(action, ctx, path)
  refineSharedCastingAbility(action, spellsById, ctx, path)
}

function refineSpellOwnership(
  action: SpellEntryLike,
  ctx: z.RefinementCtx,
  path: (string | number)[],
): void {
  const spells = action.spells ?? []
  if (action.limitedUse && spells.some((spell) => spell.limitedUse)) {
    addCustomRefinementIssue(ctx, 'A spell entry cannot limit both the entry and its spells.', [
      ...path,
      'limitedUse',
    ])
  }
  const spellIds = spells.flatMap((spell) => (spell.spellId ? [spell.spellId] : []))
  if (new Set(spellIds).size === spellIds.length) return
  addCustomRefinementIssue(ctx, 'Spell ids must be unique within an entry.', [...path, 'spells'])
}

function refineSharedCastingAbility(
  action: SpellEntryLike,
  spellsById: ReadonlyMap<string, SpellEntryLike>,
  ctx: z.RefinementCtx,
  path: (string | number)[],
): void {
  if (action.castingAbility?.kind !== 'shared' || !action.castingAbility.entryId) return
  const target = spellsById.get(action.castingAbility.entryId)
  const valid = target && target.id !== action.id && target.castingAbility?.kind === 'ability'
  if (valid) return
  addCustomRefinementIssue(
    ctx,
    'Shared spellcasting must use another spell entry that has its own ability.',
    [...path, 'castingAbility', 'entryId'],
  )
}

function refineNaturalWeaponShape(
  action: Extract<MonsterAction | MonsterReaction, { kind: 'natural-weapon' }>,
  ctx: z.RefinementCtx,
  path: (string | number)[],
): void {
  if (!action.name) {
    addCustomRefinementIssue(ctx, 'Natural weapon actions require a name.', [...path, 'name'])
  }
  if (action.mode === 'ranged' && !action.range) {
    addCustomRefinementIssue(ctx, 'Ranged natural weapons require range.', [...path, 'range'])
  }
  if (action.mode === 'ranged' && action.reach !== undefined) {
    addCustomRefinementIssue(ctx, 'Reach is only allowed on melee natural weapons.', [
      ...path,
      'reach',
    ])
  }
}

function refineAuthoredAttackShape(
  action: Extract<MonsterAction | MonsterReaction, { kind: 'attack' }>,
  ctx: z.RefinementCtx,
  path: (string | number)[],
): void {
  if (!action.name) {
    addCustomRefinementIssue(ctx, 'This action requires a name.', [...path, 'name'])
  }
  if (!action.modes) return
  if (new Set(action.modes).size !== action.modes.length) {
    addCustomRefinementIssue(ctx, 'Attack modes must be unique.', [...path, 'modes'])
  }
  if (action.modes.includes('melee') && action.reach === undefined) {
    addCustomRefinementIssue(ctx, 'Melee attacks require reach.', [...path, 'reach'])
  }
  if (action.modes.includes('ranged') && !action.range) {
    addCustomRefinementIssue(ctx, 'Ranged attacks require range.', [...path, 'range'])
  }
  if (!action.modes.includes('melee') && action.reach !== undefined) {
    addCustomRefinementIssue(ctx, 'Reach is only allowed when the attack is melee.', [
      ...path,
      'reach',
    ])
  }
}

export function refineMonsterActionShape(
  action: MonsterAction | MonsterReaction,
  ctx: z.RefinementCtx,
  path: (string | number)[],
): void {
  if (action.kind === 'natural-weapon') refineNaturalWeaponShape(action, ctx, path)
  if (action.kind === 'attack') refineAuthoredAttackShape(action, ctx, path)
  if ((action.kind === 'special' || action.kind === 'spell') && !action.name) {
    addCustomRefinementIssue(ctx, 'This action requires a name.', [...path, 'name'])
  }
}
