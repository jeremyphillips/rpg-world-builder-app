import { z } from 'zod'

import { addCustomRefinementIssue } from '../../../lib/add-custom-refinement-issue'
import { activationTriggerSchema } from '../../primitives/activation-trigger'
import { attackOnHitSchema } from '../../primitives/mechanics/attack-on-hit'
import { limitedUseDraftSchema, limitedUseSchema } from '../../primitives/limited-use'
import { abilitySchema } from '../../vocab/ability'
import { damageTypeIdSchema } from '../../vocab/damage'
import { movementAllowanceSchema } from '../../vocab/movement-allowance'
import { spellComponentIdSchema } from '../../vocab/spell/components'
import { reachFeetSchema } from '../../vocab/attack/melee-reach'
import { weaponModeSchema } from '../../vocab/weapon'
import { entryProvenanceField } from '../../primitives/provenance'
import {
  effectResolutionFieldShape,
  effectResolutionMethodSchema,
  effectResolutionSchema,
  validateEffectResolution,
} from '../lib/resolution/schema'
import { RESOLUTION_SELECTION_MODES } from '../../vocab/resolution'
import { getActionPreset } from '../action/action-presets'
import {
  castingAbilitySchema,
  savingThrowEffectDraftSchema,
  savingThrowEffectSchema,
} from '../lib/saving-throw/schema'
import { monsterActionAuthoring } from './monster-action-authoring'
import { naturalAttackFormSchema } from '../../vocab/action/natural-attack-form'
import { spellReferenceSchema } from '../spell/spell-reference'
import { findSpellCastingSource, listDirectSpellCastingSources } from './spell-casting-source'
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

const draftEffectDescriptionSchema = z.string().optional()

const attackOnHitDraftEffectSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('damage'),
    roll: weaponDamageDraftSchema.optional(),
    damageType: damageTypeIdSchema.optional(),
    description: draftEffectDescriptionSchema,
  }),
  z.object({
    kind: z.literal('condition'),
    conditionId: z.string().optional(),
    description: draftEffectDescriptionSchema,
  }),
  z.object({
    kind: z.literal('note'),
    description: draftEffectDescriptionSchema,
  }),
])

const attackOnHitDraftSchema = z.object({
  effects: z.array(attackOnHitDraftEffectSchema).optional(),
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

const monsterSaveSelectionMessage =
  'Saving throw actions select an area from self or creatures in reach or at a distance.'

const monsterSaveResolutionSchema = z
  .object({
    ...effectResolutionFieldShape,
    selectionMode: z.enum(RESOLUTION_SELECTION_MODES, monsterSaveSelectionMessage),
    method: effectResolutionMethodSchema,
  })
  .strict()
  .superRefine(validateEffectResolution)

function saveResolutionSchema<M extends MonsterActionMode>(mode: M) {
  const published = monsterSaveResolutionSchema
  const draft = effectResolutionSchema.optional()
  return (mode === 'draft' ? draft : published) as M extends 'draft'
    ? typeof draft
    : typeof published
}

function savingThrowFieldSchema(mode: MonsterActionMode) {
  return mode === 'draft'
    ? savingThrowEffectDraftSchema.optional()
    : savingThrowEffectSchema.optional()
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
    ...entryProvenanceField,
  }
  const {
    description: _referenceDescription,
    limitedUse: _referenceLimitedUse,
    ...referenceIdentity
  } = identity
  const actionIds =
    mode === 'draft'
      ? z.array(z.string().min(1)).default([])
      : z.array(z.string().min(1)).min(1, 'Choose an attack or ability.')
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
    }),
    z.object({
      ...referenceIdentity,
      kind: z.literal('action-reference'),
      name: strict(z.string().min(1), mode),
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

function omitActionKinds<T extends { shape: { kind: z.ZodType } }>(
  options: readonly T[],
  kinds: readonly string[],
) {
  return options.filter(
    (option) => !kinds.some((kind) => option.shape.kind.safeParse(kind).success),
  ) as unknown as [T, T, ...T[]]
}

const publishedActionFields = monsterActionFields('published')

const sharedActionKinds = ['action-reference'] as const
const legendaryOmittedKinds = ['weapon', 'natural-weapon', 'attack', 'save', 'multiattack'] as const

export const monsterActionSchema = z.discriminatedUnion(
  'kind',
  omitActionKinds(publishedActionFields, sharedActionKinds),
)

export const monsterLegendaryActionSchema = z.discriminatedUnion(
  'kind',
  omitActionKinds(publishedActionFields, legendaryOmittedKinds),
)

const reactionTriggerField = { trigger: activationTriggerSchema.optional() } as const

function reactionsFromActions<T extends { shape: { kind: z.ZodType } }>(options: readonly T[]) {
  const extended = omitActionKinds(options, ['multiattack', 'action-reference']).map((option) =>
    (option as unknown as z.ZodObject).extend(reactionTriggerField),
  )
  return z.discriminatedUnion(
    'kind',
    extended as unknown as [z.ZodObject, z.ZodObject, ...z.ZodObject[]],
  )
}

type WithReactionTrigger<T> = T & {
  trigger?: z.infer<typeof activationTriggerSchema>
}

export type MonsterAction = z.infer<typeof monsterActionSchema>
export type MonsterLegendaryAction = z.infer<typeof monsterLegendaryActionSchema>
export type MonsterReaction = WithReactionTrigger<Exclude<MonsterAction, { kind: 'multiattack' }>>

export const monsterReactionSchema = reactionsFromActions(
  monsterActionSchema.options,
) as unknown as z.ZodType<MonsterReaction>

const draftActionFields = monsterActionFields('draft')

export const monsterActionDraftSchema = z.discriminatedUnion(
  'kind',
  omitActionKinds(draftActionFields, sharedActionKinds),
)

export const monsterLegendaryActionDraftSchema = z.discriminatedUnion(
  'kind',
  omitActionKinds(draftActionFields, legendaryOmittedKinds),
)

export type MonsterActionDraft = z.infer<typeof monsterActionDraftSchema>
export type MonsterLegendaryActionDraft = z.infer<typeof monsterLegendaryActionDraftSchema>
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
  castingAbility?: { kind: string; entryId?: string; ability?: string }
  spellInvocation?: string
  bonusSource?: { kind?: string; castingAbility?: { kind?: string; entryId?: string } }
  dcSource?: { kind?: string; castingAbility?: { kind?: string; entryId?: string } }
  savingThrow?: {
    dcSource?: { kind?: string; castingAbility?: { kind?: string; entryId?: string } }
  }
  spells?: readonly { spellId?: string; castAtLevel?: number; limitedUse?: unknown }[]
}

export function refineMonsterSpellEntries(
  sections: {
    actions?: readonly SpellEntryLike[]
    bonusActions?: readonly SpellEntryLike[]
    reactions?: readonly SpellEntryLike[]
    legendaryActions?: readonly SpellEntryLike[]
  },
  ctx: z.RefinementCtx,
  prefix: (string | number)[] = [],
  options?: { published?: boolean },
): void {
  const located = (['actions', 'bonusActions', 'reactions', 'legendaryActions'] as const).flatMap(
    (section) => (sections[section] ?? []).map((action, index) => ({ section, index, action })),
  )
  const spellsById = new Map(
    located
      .filter((entry) => entry.action.kind === 'spell' && entry.section !== 'legendaryActions')
      .map((entry) => [entry.action.id, entry.action]),
  )

  for (const locatedEntry of located) {
    refineOneSpellEntry(locatedEntry, spellsById, ctx, prefix, options?.published === true)
    if (options?.published) refineNestedSpellSource(locatedEntry, sections, ctx, prefix)
  }
  if (options?.published) refineUniqueDirectCastingNames(sections, ctx, prefix)
}

function refineOneSpellEntry(
  locatedEntry: { section: string; index: number; action: SpellEntryLike },
  spellsById: ReadonlyMap<string, SpellEntryLike>,
  ctx: z.RefinementCtx,
  prefix: (string | number)[],
  published: boolean,
): void {
  const { section, index, action } = locatedEntry
  if (action.kind !== 'spell') return
  const path = [...prefix, section, index]
  refineSpellOwnership(action, ctx, path)
  refineSharedCastingAbility(action, spellsById, ctx, path)
  refineLegendarySpellShape(action, section, ctx, path, published)
  if (published) refineSpellInvocation(action, spellsById, ctx, path, section)
}

function sharedSpellEntryId(action: SpellEntryLike): string | undefined {
  if (action.castingAbility?.kind !== 'shared') return undefined
  return action.castingAbility.entryId
}

function refineInvokedSpell(
  spell: NonNullable<SpellEntryLike['spells']>[number],
  source: NonNullable<SpellEntryLike['spells']>[number] | undefined,
  ctx: z.RefinementCtx,
  path: (string | number)[],
  spellIndex: number,
): void {
  if (!spell.spellId) return
  if (!source) {
    addCustomRefinementIssue(ctx, "This spell isn't on the selected Spellcasting action.", [
      ...path,
      'spells',
      spellIndex,
      'spellId',
    ])
    return
  }
  if (spell.castAtLevel === undefined || spell.castAtLevel === source.castAtLevel) return
  addCustomRefinementIssue(ctx, 'Cast level must match the Spellcasting action.', [
    ...path,
    'spells',
    spellIndex,
    'castAtLevel',
  ])
}

function refineLegendarySpellShape(
  action: SpellEntryLike,
  section: string,
  ctx: z.RefinementCtx,
  path: (string | number)[],
  published: boolean,
): void {
  if (action.spellInvocation === 'use-entry' && section !== 'legendaryActions') {
    addCustomRefinementIssue(ctx, 'Spellcasting references are only valid in Legendary Actions.', [
      ...path,
      'spellInvocation',
    ])
  }
  if (!published || section !== 'legendaryActions') return
  if ((action.spells ?? []).length === 1) return
  addCustomRefinementIssue(ctx, 'Choose one spell.', [...path, 'spells'])
}

function refineSpellInvocation(
  action: SpellEntryLike,
  spellsById: ReadonlyMap<string, SpellEntryLike>,
  ctx: z.RefinementCtx,
  path: (string | number)[],
  section: string,
): void {
  if (action.spellInvocation !== 'use-entry' || section !== 'legendaryActions') return
  const entryId = sharedSpellEntryId(action)
  if (!entryId) {
    addCustomRefinementIssue(ctx, 'Choose a Spellcasting action.', [...path, 'castingAbility'])
    return
  }
  const target = spellsById.get(entryId)
  if (!target) return
  for (const [spellIndex, spell] of (action.spells ?? []).entries()) {
    const source = target.spells?.find((entry) => entry.spellId === spell.spellId)
    refineInvokedSpell(spell, source, ctx, path, spellIndex)
  }
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

const DUPLICATE_CASTING_SOURCE_NAME =
  'Spellcasting sources that define an ability must have unique names.'

function nestedSharedEntryId(
  source: { kind?: string; castingAbility?: { kind?: string; entryId?: string } } | undefined,
): string | undefined {
  if (source?.kind !== 'spellcasting' || source.castingAbility?.kind !== 'shared') return undefined
  return source.castingAbility.entryId
}

function refineNestedSpellSource(
  locatedEntry: { section: string; index: number; action: SpellEntryLike },
  sections: {
    actions?: readonly SpellEntryLike[]
    bonusActions?: readonly SpellEntryLike[]
    reactions?: readonly SpellEntryLike[]
  },
  ctx: z.RefinementCtx,
  prefix: (string | number)[],
): void {
  const { section, index, action } = locatedEntry
  const nested =
    action.kind === 'attack'
      ? { path: ['bonusSource'], entryId: nestedSharedEntryId(action.bonusSource) }
      : action.kind === 'save'
        ? { path: ['dcSource'], entryId: nestedSharedEntryId(action.dcSource) }
        : action.kind === 'special'
          ? {
              path: ['savingThrow', 'dcSource'],
              entryId: nestedSharedEntryId(action.savingThrow?.dcSource),
            }
          : undefined
  if (!nested?.entryId) return
  if (findSpellCastingSource(sections, nested.entryId)) return
  addCustomRefinementIssue(
    ctx,
    'Shared spellcasting must use another spell entry that has its own ability.',
    [...prefix, section, index, ...nested.path, 'castingAbility', 'entryId'],
  )
}

function refineUniqueDirectCastingNames(
  sections: {
    actions?: readonly SpellEntryLike[]
    bonusActions?: readonly SpellEntryLike[]
    reactions?: readonly SpellEntryLike[]
    legendaryActions?: readonly SpellEntryLike[]
  },
  ctx: z.RefinementCtx,
  prefix: (string | number)[],
): void {
  const seen = new Set<string>()
  for (const source of listDirectSpellCastingSources(sections)) {
    const name = source.name?.trim()
    if (!name) continue
    if (seen.has(name)) {
      const index = (sections[source.section] ?? []).findIndex((row) => row.id === source.id)
      addCustomRefinementIssue(ctx, DUPLICATE_CASTING_SOURCE_NAME, [
        ...prefix,
        source.section,
        index,
        'name',
      ])
      continue
    }
    seen.add(name)
  }
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
  if (!action.modes) return
  if (new Set(action.modes).size !== action.modes.length) {
    addCustomRefinementIssue(ctx, 'Attack modes must be unique.', [...path, 'modes'])
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

/** Rich-text shells such as `<p></p>` are not authored rules text. */
export const RULES_OR_SAVING_THROW_MESSAGE = 'Enter rules text or a saving throw.'

export function monsterRichTextIsEmpty(value: string): boolean {
  return (
    value
      .replace(/<br\s*\/?>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .trim().length === 0
  )
}

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

function refineUnknownPreset(
  action: { preset?: string },
  ctx: z.RefinementCtx,
  path: (string | number)[],
): void {
  if (action.preset && !getActionPreset(action.preset)) {
    addCustomRefinementIssue(ctx, 'Unknown action preset.', [...path, 'preset'])
  }
}

function refineAuthoredActionName(
  action: MonsterAction | MonsterReaction | MonsterLegendaryAction,
  ctx: z.RefinementCtx,
  path: (string | number)[],
): void {
  if (monsterActionAuthoring(action).name === 'authored' && !action.name?.trim()) {
    addCustomRefinementIssue(ctx, 'Name is required.', [...path, 'name'])
  }
}

function refineSpecialRulesText(
  action: MonsterAction | MonsterReaction | MonsterLegendaryAction,
  ctx: z.RefinementCtx,
  path: (string | number)[],
): void {
  if (action.kind !== 'special') return
  const text = typeof action.description === 'string' ? action.description : ''
  const hasSave = action.savingThrow != null
  if ((text.length === 0 || monsterRichTextIsEmpty(text)) && !hasSave) {
    addCustomRefinementIssue(ctx, RULES_OR_SAVING_THROW_MESSAGE, [...path, 'description'])
  }
}

export function refineMonsterActionShape(
  action: MonsterAction | MonsterReaction | MonsterLegendaryAction,
  ctx: z.RefinementCtx,
  path: (string | number)[],
): void {
  refineUnknownPreset(action, ctx, path)
  refineAuthoredActionName(action, ctx, path)
  refineSpecialRulesText(action, ctx, path)
  if (action.kind === 'natural-weapon') refineNaturalWeaponShape(action, ctx, path)
  if (action.kind === 'attack') refineAuthoredAttackShape(action, ctx, path)
  if (action.kind === 'save') refineMonsterSaveResolution(action, ctx, path)
}
