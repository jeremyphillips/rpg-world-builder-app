import { z } from 'zod'

import { addCustomRefinementIssue } from '../../../lib/add-custom-refinement-issue'
import { activationTriggerSchema } from '../../primitives/activation-trigger'
import { attackOnHitSchema } from '../../primitives/mechanics/attack-on-hit'
import { limitedUseDraftSchema, limitedUseSchema } from '../../primitives/limited-use'
import { abilitySchema } from '../../vocab/ability'
import { damageTypeIdSchema } from '../../vocab/damage'
import { spellComponentIdSchema } from '../../vocab/spell/components'
import { reachFeetSchema } from '../../vocab/attack/melee-reach'
import { weaponModeSchema } from '../../vocab/weapon'
import { entryProvenanceField } from '../../primitives/provenance'
import { effectResolutionSchema } from '../lib/resolution/schema'
import { naturalAttackFormSchema } from '../../vocab/action/natural-attack-form'
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

const multiattackDraftStepSchema = z.object({
  count: z.number().int().min(1).optional(),
  actionIds: z.array(z.string().min(1)),
})

const multiattackPublishedStepSchema = z.object({
  count: z.number().int().min(1),
  actionIds: z.array(z.string().min(1)).min(1),
})

function multiattackStepsSchema<M extends MonsterActionMode>(mode: M) {
  const draft = z.array(multiattackDraftStepSchema).default([])
  const published = z.array(multiattackPublishedStepSchema).min(1)
  return (mode === 'draft' ? draft : published) as M extends 'draft'
    ? typeof draft
    : typeof published
}

function saveResolutionSchema<M extends MonsterActionMode>(mode: M) {
  const published = effectResolutionSchema
  const draft = effectResolutionSchema.optional()
  return (mode === 'draft' ? draft : published) as M extends 'draft'
    ? typeof draft
    : typeof published
}

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
    preset: z.string().min(1).optional(),
    description: z.string().optional(),
    limitedUse: limitedUse.optional(),
    available: z.boolean().optional(),
    ...entryProvenanceField,
  }
  const monsterAbilitySourceSchema = z.discriminatedUnion('kind', [
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
    z.object({
      ...identity,
      kind: z.literal('save'),
      name: strict(z.string().min(1), mode),
      dcSource: strict(monsterAbilitySourceSchema, mode),
      resolution: saveResolutionSchema(mode),
    }),
    z.object({
      ...identity,
      kind: z.literal('multiattack'),
      name: strict(z.string().min(1), mode),
      steps: multiattackStepsSchema(mode),
    }),
  ] as const
}

export const monsterActionSchema = z.discriminatedUnion('kind', [
  ...monsterActionFields('published'),
])

const reactionTriggerField = { trigger: activationTriggerSchema.optional() } as const

function reactionsFromActions<T extends { shape: { kind: z.ZodType } }>(options: readonly T[]) {
  const extended = options
    .filter((option) => !option.shape.kind.safeParse('multiattack').success)
    .map((option) => (option as unknown as z.ZodObject).extend(reactionTriggerField))
  return z.discriminatedUnion(
    'kind',
    extended as unknown as [z.ZodObject, z.ZodObject, ...z.ZodObject[]],
  )
}

type WithReactionTrigger<T> = T & {
  trigger?: z.infer<typeof activationTriggerSchema>
}

export type MonsterAction = z.infer<typeof monsterActionSchema>
export type MonsterReaction = WithReactionTrigger<Exclude<MonsterAction, { kind: 'multiattack' }>>

export const monsterReactionSchema = reactionsFromActions(
  monsterActionSchema.options,
) as unknown as z.ZodType<MonsterReaction>

export const monsterActionDraftSchema = z.discriminatedUnion('kind', [
  ...monsterActionFields('draft'),
])

export type MonsterActionDraft = z.infer<typeof monsterActionDraftSchema>
export type MonsterReactionDraft = WithReactionTrigger<
  Exclude<MonsterActionDraft, { kind: 'multiattack' }>
>

export const monsterReactionDraftSchema = reactionsFromActions(
  monsterActionDraftSchema.options,
) as unknown as z.ZodType<MonsterReactionDraft>

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

const MONSTER_SAVE_OUTCOME_RESULTS = new Set(['failed-save', 'successful-save'])

function refineMonsterSaveResolution(
  action: Extract<MonsterAction | MonsterReaction, { kind: 'save' }>,
  ctx: z.RefinementCtx,
  path: (string | number)[],
): void {
  const resolution = action.resolution
  if (!resolution) return
  if (resolution.method.kind !== 'saving-throw') {
    addCustomRefinementIssue(ctx, 'Saving throw actions require a saving throw.', [
      ...path,
      'resolution',
      'method',
      'kind',
    ])
  }
  const creatureInReach =
    resolution.selectionMode === 'targets' &&
    resolution.target?.kind === 'creature' &&
    (resolution.target.proximity.kind === 'reach' ||
      resolution.target.proximity.kind === 'distance')
  const areaFromSelf = resolution.selectionMode === 'self' && Boolean(resolution.areaOfEffect)
  if (!creatureInReach && !areaFromSelf) {
    addCustomRefinementIssue(
      ctx,
      'Saving throw actions select an area from self or creatures in reach or at a distance.',
      [...path, 'resolution', 'selectionMode'],
    )
  }
  resolution.effects.forEach((effect, effectIndex) => {
    if (effect.kind === 'damage') return
    addCustomRefinementIssue(ctx, 'Saving throw actions can only deal damage.', [
      ...path,
      'resolution',
      'effects',
      effectIndex,
      'kind',
    ])
  })
  resolution.outcomes.forEach((outcome, outcomeIndex) => {
    if (MONSTER_SAVE_OUTCOME_RESULTS.has(outcome.result)) return
    addCustomRefinementIssue(ctx, 'Saving throw outcomes must be a failed or successful save.', [
      ...path,
      'resolution',
      'outcomes',
      outcomeIndex,
      'result',
    ])
  })
}

export function refineMonsterActionShape(
  action: MonsterAction | MonsterReaction,
  ctx: z.RefinementCtx,
  path: (string | number)[],
): void {
  if (action.kind === 'natural-weapon') refineNaturalWeaponShape(action, ctx, path)
  if (action.kind === 'attack') refineAuthoredAttackShape(action, ctx, path)
  if (action.kind === 'save') refineMonsterSaveResolution(action, ctx, path)
  if (
    (action.kind === 'special' ||
      action.kind === 'spell' ||
      action.kind === 'save' ||
      action.kind === 'multiattack') &&
    !action.name
  ) {
    addCustomRefinementIssue(ctx, 'This action requires a name.', [...path, 'name'])
  }
}
