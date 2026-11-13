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
import { MONSTER_SECTION_KINDS } from './action-section-eligibility'
import { BONUS_ACTION_COMBINATIONS, BONUS_STANDARD_ACTION_IDS } from './bonus-standard-actions'
import {
  castingAbilitySchema,
  savingThrowEffectDraftSchema,
  savingThrowEffectSchema,
} from '../lib/saving-throw/schema'
import { monsterActionAuthoring } from './monster-action-authoring'
import { naturalAttackFormSchema } from '../../vocab/action/natural-attack-form'
import { spellReferenceSchema } from '../spell/spell-reference'
import {
  findSpellCastingSource,
  isPrimarySpellcastingAction,
  listDirectSpellCastingSources,
  MONSTER_SPELLCASTING_ACTION_NAME,
  PRIMARY_SPELLCASTING_DUPLICATE_MESSAGE,
  PRIMARY_SPELLCASTING_NAME_MESSAGE,
  PRIMARY_SPELLCASTING_PROFILE,
  PRIMARY_SPELLCASTING_SECTION_MESSAGE,
} from './spell-casting-source'
import {
  weaponDamageDraftSchema,
  weaponDamageSchema,
  weaponRangeSchema,
} from '../equipment/weapon-variant'

export const PARRY_AC_BONUS_MIN = 1
export const PARRY_AC_BONUS_MAX = 10
export const PARRY_AC_BONUS_DEFAULT = 2

const parryAcBonusSchema = z
  .number()
  .int()
  .min(PARRY_AC_BONUS_MIN, 'AC bonus must be at least 1.')
  .max(PARRY_AC_BONUS_MAX, 'AC bonus cannot exceed 10.')

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

function omitActionKinds<T extends { shape: { kind: z.ZodType } }>(
  options: readonly T[],
  kinds: readonly string[],
) {
  return options.filter(
    (option) => !kinds.some((kind) => option.shape.kind.safeParse(kind).success),
  ) as unknown as [T, T, ...T[]]
}

const publishedActionFields = monsterActionFields('published')
const draftActionFields = monsterActionFields('draft')

const ACTION_FIELD_KINDS = [
  'weapon',
  'natural-weapon',
  'attack',
  'save',
  'special',
  'spell',
  'multiattack',
  'action-reference',
] as const

function omittedSectionKinds(section: 'actions' | 'bonusActions' | 'legendaryActions') {
  const allowed = new Set<string>(MONSTER_SECTION_KINDS[section])
  return ACTION_FIELD_KINDS.filter((kind) => !allowed.has(kind))
}

export const monsterActionSchema = z.discriminatedUnion(
  'kind',
  omitActionKinds(publishedActionFields, omittedSectionKinds('actions')),
)

const positiveWholeFeetSchema = z.number().int().min(1)

const bonusPassengerSchema = z.object({
  phrase: z.string().optional(),
  withinFeet: positiveWholeFeetSchema.optional(),
})

function bonusLimitedUse<M extends MonsterActionMode>(mode: M) {
  return (mode === 'draft' ? limitedUseDraftSchema : limitedUseSchema) as M extends 'draft'
    ? typeof limitedUseDraftSchema
    : typeof limitedUseSchema
}

function leapSchema<M extends MonsterActionMode>(mode: M) {
  return z.object({
    id: z.string().min(1),
    kind: z.literal('leap'),
    name: strict(z.string().min(1), mode),
    distanceFeet: strict(positiveWholeFeetSchema, mode),
    movementFeet: strict(positiveWholeFeetSchema, mode),
    limitedUse: bonusLimitedUse(mode).optional(),
    available: z.boolean().optional(),
    ...entryProvenanceField,
  })
}

function teleportSchema<M extends MonsterActionMode>(mode: M) {
  return z
    .object({
      id: z.string().min(1),
      kind: z.literal('teleport'),
      name: strict(z.string().min(1), mode),
      distanceFeet: strict(positiveWholeFeetSchema, mode),
      /** Absent when Include another creature is closed. */
      passenger: bonusPassengerSchema.optional(),
      limitedUse: bonusLimitedUse(mode).optional(),
      available: z.boolean().optional(),
      ...entryProvenanceField,
    })
    .superRefine((action, ctx) => {
      if (mode === 'draft' || !action.passenger) return
      const phrase = action.passenger.phrase?.trim()
      if (!phrase) {
        addCustomRefinementIssue(ctx, 'Creature is required.', ['passenger', 'phrase'])
      }
      if (!action.passenger.withinFeet) {
        addCustomRefinementIssue(ctx, 'Within is required.', ['passenger', 'withinFeet'])
      }
    })
}

function takeActionsSchema<M extends MonsterActionMode>(mode: M) {
  const standardActions =
    mode === 'draft'
      ? z.array(z.enum(BONUS_STANDARD_ACTION_IDS)).default([])
      : z.array(z.enum(BONUS_STANDARD_ACTION_IDS)).min(1)
  return z
    .object({
      id: z.string().min(1),
      kind: z.literal('take-actions'),
      name: strict(z.string().min(1), mode),
      standardActions,
      /** Absent when fewer than two actions are selected. */
      combination: z.enum(BONUS_ACTION_COMBINATIONS).optional(),
      restriction: z.string().optional(),
      limitedUse: bonusLimitedUse(mode).optional(),
      available: z.boolean().optional(),
      ...entryProvenanceField,
    })
    .superRefine((action, ctx) => {
      if (mode === 'draft') return
      if (action.standardActions.length >= 2 && !action.combination) {
        addCustomRefinementIssue(ctx, 'Choose how these actions combine.', ['combination'])
      }
    })
}

export const monsterBonusActionSchema = z.discriminatedUnion('kind', [
  ...omitActionKinds(publishedActionFields, omittedSectionKinds('bonusActions')),
  leapSchema('published'),
  teleportSchema('published'),
  takeActionsSchema('published'),
])

export const monsterLegendaryActionSchema = z.discriminatedUnion(
  'kind',
  omitActionKinds(publishedActionFields, omittedSectionKinds('legendaryActions')),
)

const reactionTriggerField = { trigger: activationTriggerSchema.optional() } as const

function reactionReferenceSchema(mode: MonsterActionMode) {
  const actionIds =
    mode === 'draft'
      ? z.array(z.string().min(1)).max(1).default([])
      : z.array(z.string().min(1)).min(1, 'Choose an attack or ability from Actions.').max(1)
  return z.object({
    id: z.string().min(1),
    kind: z.literal('action-reference'),
    name: z.string().min(1).optional(),
    trigger: activationTriggerSchema.optional(),
    description: z.string().optional(),
    actionIds,
    available: z.boolean().optional(),
    ...entryProvenanceField,
  })
}

function parrySchema(mode: MonsterActionMode) {
  return z.object({
    id: z.string().min(1),
    kind: z.literal('parry'),
    name: strict(z.string().min(1), mode),
    acBonus: mode === 'draft' ? parryAcBonusSchema.optional() : parryAcBonusSchema,
    /** Absent when the on-miss disclosure is closed. An empty string is an open, unset attack. */
    followUpActionId: z.string().min(1, 'Choose an attack.').optional(),
    available: z.boolean().optional(),
    ...entryProvenanceField,
  })
}

function extendReactionSources<T extends { shape: { kind: z.ZodType } }>(options: readonly T[]) {
  return omitActionKinds(options, [
    'weapon',
    'natural-weapon',
    'attack',
    'save',
    'multiattack',
    'action-reference',
  ]).map((option) => (option as unknown as z.ZodObject).extend(reactionTriggerField))
}

const publishedReactionReferenceSchema = reactionReferenceSchema('published')
const draftReactionReferenceSchema = reactionReferenceSchema('draft')
const publishedParrySchema = parrySchema('published')
const draftParrySchema = parrySchema('draft')

function reactionSchema(mode: MonsterActionMode) {
  const extended =
    mode === 'published'
      ? extendReactionSources(publishedActionFields)
      : extendReactionSources(draftActionFields)
  const reference =
    mode === 'published' ? publishedReactionReferenceSchema : draftReactionReferenceSchema
  const parry = mode === 'published' ? publishedParrySchema : draftParrySchema
  return z.discriminatedUnion('kind', [...extended, reference, parry] as unknown as [
    z.ZodObject,
    z.ZodObject,
    ...z.ZodObject[],
  ])
}

type ReactionTrigger = { trigger?: { text: string } }

export const monsterReactionSchema = reactionSchema(
  'published',
) as unknown as z.ZodType<MonsterReaction>
export const monsterReactionDraftSchema = reactionSchema(
  'draft',
) as unknown as z.ZodType<MonsterReactionDraft>

export type MonsterAction = z.infer<typeof monsterActionSchema>
export type MonsterBonusAction = z.infer<typeof monsterBonusActionSchema>
export type MonsterLegendaryAction = z.infer<typeof monsterLegendaryActionSchema>
export type MonsterReaction =
  | (Extract<MonsterAction, { kind: 'spell' | 'special' }> & ReactionTrigger)
  | z.infer<typeof publishedReactionReferenceSchema>
  | z.infer<typeof publishedParrySchema>
export type MonsterReactionDraft =
  | (Extract<MonsterActionDraft, { kind: 'spell' | 'special' }> & ReactionTrigger)
  | z.infer<typeof draftReactionReferenceSchema>
  | z.infer<typeof draftParrySchema>

export const monsterActionDraftSchema = z.discriminatedUnion(
  'kind',
  omitActionKinds(draftActionFields, omittedSectionKinds('actions')),
)

export const monsterBonusActionDraftSchema = z.discriminatedUnion('kind', [
  ...omitActionKinds(draftActionFields, omittedSectionKinds('bonusActions')),
  leapSchema('draft'),
  teleportSchema('draft'),
  takeActionsSchema('draft'),
])

export const monsterLegendaryActionDraftSchema = z.discriminatedUnion(
  'kind',
  omitActionKinds(draftActionFields, omittedSectionKinds('legendaryActions')),
)

export type MonsterActionDraft = z.infer<typeof monsterActionDraftSchema>
export type MonsterBonusActionDraft = z.infer<typeof monsterBonusActionDraftSchema>
export type MonsterLegendaryActionDraft = z.infer<typeof monsterLegendaryActionDraftSchema>

type SpellEntryLike = {
  id: string
  kind: string
  name?: string
  profile?: string
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
  refinePrimarySpellcastingProfiles(sections, ctx, prefix, options?.published === true)
  if (options?.published) refineUniqueDirectCastingNames(sections, ctx, prefix)
}

type LocatedSpell = { section: string; index: number; action: SpellEntryLike }

function spellRows(sections: {
  actions?: readonly SpellEntryLike[]
  bonusActions?: readonly SpellEntryLike[]
  reactions?: readonly SpellEntryLike[]
  legendaryActions?: readonly SpellEntryLike[]
}): LocatedSpell[] {
  return (['actions', 'bonusActions', 'reactions', 'legendaryActions'] as const).flatMap(
    (section) => (sections[section] ?? []).map((action, index) => ({ section, index, action })),
  )
}

function refineReservedSpellcastingName(
  row: LocatedSpell,
  ctx: z.RefinementCtx,
  prefix: (string | number)[],
): void {
  if (row.action.kind !== 'spell') return
  if (row.action.name?.trim() !== MONSTER_SPELLCASTING_ACTION_NAME) return
  if (isPrimarySpellcastingAction(row.action)) return
  addCustomRefinementIssue(ctx, PRIMARY_SPELLCASTING_NAME_MESSAGE, [
    ...prefix,
    row.section,
    row.index,
    'name',
  ])
}

function refineOnePrimarySpellcastingProfile(
  row: LocatedSpell,
  ctx: z.RefinementCtx,
  prefix: (string | number)[],
  requireCanonicalName: boolean,
): void {
  if (row.section !== 'actions') {
    addCustomRefinementIssue(ctx, PRIMARY_SPELLCASTING_SECTION_MESSAGE, [
      ...prefix,
      row.section,
      row.index,
      'profile',
    ])
  }
  if (!requireCanonicalName || row.action.name?.trim() === MONSTER_SPELLCASTING_ACTION_NAME) return
  addCustomRefinementIssue(ctx, PRIMARY_SPELLCASTING_NAME_MESSAGE, [
    ...prefix,
    row.section,
    row.index,
    'name',
  ])
}

function refinePrimarySpellcastingProfiles(
  sections: {
    actions?: readonly SpellEntryLike[]
    bonusActions?: readonly SpellEntryLike[]
    reactions?: readonly SpellEntryLike[]
    legendaryActions?: readonly SpellEntryLike[]
  },
  ctx: z.RefinementCtx,
  prefix: (string | number)[],
  requireCanonicalName: boolean,
): void {
  const rows = spellRows(sections)
  for (const row of rows) refineReservedSpellcastingName(row, ctx, prefix)
  const profiles = rows.filter((row) => isPrimarySpellcastingAction(row.action))
  for (const row of profiles) {
    refineOnePrimarySpellcastingProfile(row, ctx, prefix, requireCanonicalName)
  }
  for (const extra of profiles.slice(1)) {
    addCustomRefinementIssue(ctx, PRIMARY_SPELLCASTING_DUPLICATE_MESSAGE, [
      ...prefix,
      extra.section,
      extra.index,
      'profile',
    ])
  }
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
  action: MonsterAction | MonsterBonusAction | MonsterReaction | MonsterLegendaryAction,
  ctx: z.RefinementCtx,
  path: (string | number)[],
): void {
  if (action.kind === 'action-reference') return
  if (monsterActionAuthoring(action).name === 'authored' && !action.name?.trim()) {
    addCustomRefinementIssue(ctx, 'Name is required.', [...path, 'name'])
  }
}

function refineSpecialRulesText(
  action: MonsterAction | MonsterBonusAction | MonsterReaction | MonsterLegendaryAction,
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
  action: MonsterAction | MonsterBonusAction | MonsterReaction | MonsterLegendaryAction,
  ctx: z.RefinementCtx,
  path: (string | number)[],
): void {
  refineUnknownPreset(action as { preset?: string }, ctx, path)
  refineAuthoredActionName(action, ctx, path)
  refineSpecialRulesText(action, ctx, path)
  if (action.kind === 'natural-weapon') refineNaturalWeaponShape(action, ctx, path)
  if (action.kind === 'attack') refineAuthoredAttackShape(action, ctx, path)
  if (action.kind === 'save') refineMonsterSaveResolution(action, ctx, path)
}
