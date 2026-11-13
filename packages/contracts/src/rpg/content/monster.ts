import { z } from 'zod'

import { addCustomRefinementIssue } from '../../lib/add-custom-refinement-issue'
import { abilitySchema } from '../vocab/ability'
import { challengeRatingSchema, CHALLENGE_RATING_MECHANICS } from '../vocab/challenge-rating'
import {
  creatureAbilityScoresSchema,
  creatureAlignmentSchema,
  creatureMovementSchema,
  creatureSensesDraftSchema,
  creatureSensesSchema,
  refineCreatureSenseRanges,
  refineCreatureTelepathyRange,
  creatureCommunicationSchema,
  EMPTY_CREATURE_COMMUNICATION,
  creatureSizesDraftSchema,
  creatureSizesSchema,
  creatureSkillProficiencyEntrySchema,
  creatureLanguageProficiencyEntrySchema,
  creatureStatBlockHitPointsSchema,
  creatureDefensesSchema,
  creatureTypeRefSchema,
  creatureWeaponProficiencyTargetSchema,
  equipmentInstanceSchemaBase,
  refineCreatureDamageDefenses,
} from './creature'
import {
  monsterPresetTraitDraftSchema,
  monsterPresetTraitSchema,
} from './creature/trait-preset-schema'
import { refineCreatureTraitTemplate } from './creature/traits/validate'
import {
  customContentTraitSchema,
  normalizeContentTrait,
  templateContentTraitSchema,
} from './lib/grants/grants'
import { MONSTER_CONTENT_TYPE_TERM } from '../primitives/content/content-type-terms'
import {
  createDraftInputSchema,
  createPublishInputSchema,
  draftStoredSchema,
  publishStoredSchema,
} from './lib/content-input-schemas'
import { contentPatchBaseSchema, type ContentMeta, type Slug } from './lib/envelope'
import {
  mediaBearingAuthoredContentBodySchema,
  mediaBearingDraftAuthoredContentBodySchema,
} from './lib/media/media-bearing-content'
import {
  monsterActionDraftSchema,
  monsterActionSchema,
  monsterBonusActionDraftSchema,
  monsterBonusActionSchema,
  monsterLegendaryActionDraftSchema,
  monsterLegendaryActionSchema,
  monsterReactionDraftSchema,
  monsterReactionSchema,
  monsterRichTextIsEmpty,
  RULES_OR_SAVING_THROW_MESSAGE,
  refineMonsterActionShape,
  refineMonsterSpellEntries,
} from './monster/action'
import { findSpellCastingSource } from './monster/spell-casting-source'
import { savingThrowEffectDraftSchema, savingThrowEffectSchema } from './lib/saving-throw/schema'
import { entryProvenanceField } from '../primitives/provenance'
import { MONSTER_ACTION_SECTIONS } from './monster/action-sections'

export { MONSTER_ACTION_SECTIONS }
export type { MonsterActionSection } from './monster/action-sections'

export {
  monsterActionSchema,
  monsterBonusActionSchema,
  monsterLegendaryActionSchema,
  monsterReactionSchema,
  monsterActionDraftSchema,
  monsterBonusActionDraftSchema,
  monsterLegendaryActionDraftSchema,
  monsterReactionDraftSchema,
  PARRY_AC_BONUS_DEFAULT,
  PARRY_AC_BONUS_MAX,
  PARRY_AC_BONUS_MIN,
} from './monster/action'
export type {
  MonsterAction,
  MonsterActionDraft,
  MonsterBonusAction,
  MonsterBonusActionDraft,
  MonsterLegendaryAction,
  MonsterLegendaryActionDraft,
  MonsterReaction,
  MonsterReactionDraft,
} from './monster/action'
export {
  ACTIONS_ONLY_PRESET_IDS,
  MONSTER_SECTION_KINDS,
  monsterSectionAllowsKind,
  monsterSectionAllowsPreset,
} from './monster/action-section-eligibility'
import type { EquipmentInstance } from './equipment/instance/instance'
import { normalizeEquipmentInstance } from './equipment/instance/normalize-equipment-instance'
import { refineEquipmentInstanceInvariants } from './equipment/instance/instance-invariants'

import { FIXED_AC_OFFSET_MIN } from '../vocab/mechanics/armor-class-scale'

export const monsterArmorClassSchema = z.object({
  naturalArmorBonus: z.number().int().min(1).optional(),
  /** Protection offset for a fixed override. Minimum -10; no maximum. */
  fixedAcOffset: z.number().int().min(FIXED_AC_OFFSET_MIN).optional(),
})

export const monsterHitPointsSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('hit-dice'), count: z.number().int().min(1) }),
  creatureStatBlockHitPointsSchema.extend({ kind: z.literal('fixed') }),
])

const monsterTraitAvailabilityFields = {
  available: z.boolean().optional(),
  ...entryProvenanceField,
}

const monsterCustomTraitSchema = customContentTraitSchema
  .extend({
    name: z.string('Name is required.').min(1),
    description: z.string().optional(),
    savingThrow: savingThrowEffectSchema.optional(),
    /** Present only on preset rows. An empty allowance keeps those rows off this branch. */
    preset: z.string().max(0).optional(),
    ...monsterTraitAvailabilityFields,
  })
  .superRefine((trait, ctx) => {
    const text = typeof trait.description === 'string' ? trait.description : ''
    if ((text.length === 0 || monsterRichTextIsEmpty(text)) && !trait.savingThrow) {
      addCustomRefinementIssue(ctx, RULES_OR_SAVING_THROW_MESSAGE, ['description'])
    }
  })

const monsterTemplateTraitSchema = templateContentTraitSchema.extend(monsterTraitAvailabilityFields)

function refineMonsterTemplateTrait(
  trait: { kind?: string; templateId?: unknown; config?: unknown },
  ctx: z.RefinementCtx,
): void {
  if (trait.kind === 'template') refineCreatureTraitTemplate(trait, ctx)
}

const monsterAuthoredTraitSchema = z
  .preprocess(
    normalizeContentTrait,
    z.discriminatedUnion('kind', [monsterCustomTraitSchema, monsterTemplateTraitSchema]),
  )
  .superRefine(refineMonsterTemplateTrait)

const monsterTraitUnion = z.union([monsterPresetTraitSchema, monsterAuthoredTraitSchema])

type TraitUnionIssue = {
  code: string
  path: PropertyKey[]
  message: string
  errors?: TraitUnionIssue[][]
}

function traitIssuePath(issue: TraitUnionIssue): PropertyKey[] {
  return Array.isArray(issue.path) ? issue.path : []
}

function traitIssuePenalty(issue: TraitUnionIssue): number {
  const key = traitIssuePath(issue)[0]
  if (key === 'preset') return 10
  if (key === 'kind' && issue.code === 'invalid_value') return 10
  if (issue.code === 'invalid_union' && issue.errors?.length) {
    return Math.min(...issue.errors.map(traitBranchPenalty))
  }
  return 1
}

function traitBranchPenalty(branch: TraitUnionIssue[]): number {
  return branch.reduce((sum, issue) => sum + traitIssuePenalty(issue), 0)
}

/** Keeps the closest variant's leaf issues instead of one collapsed union error. */
function flattenTraitIssues(
  issues: TraitUnionIssue[],
  prefix: PropertyKey[] = [],
): TraitUnionIssue[] {
  const flattened: TraitUnionIssue[] = []
  for (const issue of issues) {
    if (issue.code === 'invalid_union' && issue.errors?.length) {
      const best = [...issue.errors].sort(
        (left, right) => traitBranchPenalty(left) - traitBranchPenalty(right),
      )[0]
      flattened.push(...flattenTraitIssues(best ?? [], [...prefix, ...traitIssuePath(issue)]))
      continue
    }
    flattened.push({ ...issue, path: [...prefix, ...traitIssuePath(issue)] })
  }
  return flattened
}

/**
 * Preset rows stay a separate member so a `preset` id is not read as a custom trait.
 * Union failures keep the closest variant's field errors. The schema stays a union
 * so catalog JSON Schema generation can describe it.
 */
export const monsterTraitSchema = monsterTraitUnion

const traitUnionRun = monsterTraitSchema._zod.run.bind(monsterTraitSchema._zod)
monsterTraitSchema._zod.run = (payload, ctx) => {
  const result = traitUnionRun(payload, ctx)
  const apply = (next: typeof payload) => {
    if (next.issues.length === 0) return next
    next.issues = flattenTraitIssues(next.issues as TraitUnionIssue[]) as typeof next.issues
    return next
  }
  return result instanceof Promise ? result.then(apply) : apply(result)
}

const monsterAuthoredTraitDraftSchema = z
  .preprocess(
    normalizeContentTrait,
    z.discriminatedUnion('kind', [
      z.object({
        kind: z.literal('custom'),
        id: z.string().min(1),
        name: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
        savingThrow: savingThrowEffectDraftSchema.optional(),
        grantGroups: customContentTraitSchema.shape.grantGroups,
        ...monsterTraitAvailabilityFields,
      }),
      z.object({
        kind: z.literal('template'),
        id: z.string().min(1),
        templateId: z.string().min(1).optional(),
        config: z.unknown().optional(),
        nameOverride: z.string().min(1).optional(),
        descriptionOverride: z.string().optional(),
        ...monsterTraitAvailabilityFields,
      }),
    ]),
  )
  .superRefine((trait, ctx) => {
    if (trait.kind !== 'template' || trait.templateId === undefined) return
    refineCreatureTraitTemplate(trait, ctx)
  })

export const monsterTraitDraftSchema = z.union([
  monsterPresetTraitDraftSchema,
  monsterAuthoredTraitDraftSchema,
])

export type MonsterTrait = z.infer<typeof monsterTraitSchema>

const monsterEquipmentEntrySchemaParsed = equipmentInstanceSchemaBase
  .extend({ entryId: z.string().min(1) })
  .superRefine((entry, ctx) => refineEquipmentInstanceInvariants(entry, ctx))

export const monsterEquipmentEntrySchema = z.preprocess((value) => {
  if (!value || typeof value !== 'object') return value
  return normalizeEquipmentInstance(value as EquipmentInstance)
}, monsterEquipmentEntrySchemaParsed)

export const monsterBodyFields = {
  sizes: creatureSizesSchema,
  creatureType: creatureTypeRefSchema,
  alignment: creatureAlignmentSchema,
  abilityScores: creatureAbilityScoresSchema,
  armorClass: monsterArmorClassSchema.default({}),
  hitPoints: monsterHitPointsSchema,
  movement: creatureMovementSchema,
  hover: z.boolean().optional(),
  senses: creatureSensesSchema,
  communication: creatureCommunicationSchema.default(EMPTY_CREATURE_COMMUNICATION),
  challengeRating: challengeRatingSchema,
  experiencePointsOverride: z.number().int().min(0).optional(),
  proficiencies: z.object({
    savingThrows: z.array(abilitySchema).default([]),
    skills: z.array(creatureSkillProficiencyEntrySchema).default([]),
    languages: z.array(creatureLanguageProficiencyEntrySchema).default([]),
    additionalLanguageCount: z.number().int().min(1).optional(),
    weapons: z.array(creatureWeaponProficiencyTargetSchema).default([]),
  }),
  defenses: creatureDefensesSchema,
  equipment: z.array(monsterEquipmentEntrySchema).default([]),
  traits: z.array(monsterTraitSchema).default([]),
  actions: z.array(monsterActionSchema).default([]),
  bonusActions: z.array(monsterBonusActionSchema).default([]),
  reactions: z.array(monsterReactionSchema).default([]),
  legendaryActionUses: z.number().int().min(1).optional(),
  legendaryActionUsesInLair: z.number().int().min(1).optional(),
  legendaryActions: z.array(monsterLegendaryActionSchema).default([]),
} as const

export const monsterBodySchema = mediaBearingAuthoredContentBodySchema.extend(monsterBodyFields)

export type MonsterBody = z.infer<typeof monsterBodySchema>

const monsterBodyDraftSchemaBase = mediaBearingDraftAuthoredContentBodySchema(
  MONSTER_CONTENT_TYPE_TERM.label,
).extend({
  ...monsterBodyFields,
  sizes: creatureSizesDraftSchema,
  creatureType: creatureTypeRefSchema.optional(),
  alignment: creatureAlignmentSchema.optional(),
  abilityScores: creatureAbilityScoresSchema.partial().optional(),
  hitPoints: monsterHitPointsSchema.optional(),
  movement: creatureMovementSchema.optional(),
  senses: creatureSensesDraftSchema.optional(),
  challengeRating: challengeRatingSchema.optional(),
  actions: z.array(monsterActionDraftSchema).default([]),
  bonusActions: z.array(monsterBonusActionDraftSchema).default([]),
  reactions: z.array(monsterReactionDraftSchema).default([]),
  legendaryActions: z.array(monsterLegendaryActionDraftSchema).default([]),
  traits: z.array(monsterTraitDraftSchema).default([]),
})

export const monsterBodyDraftSchema = monsterBodyDraftSchemaBase

export type MonsterBodyDraft = z.infer<typeof monsterBodyDraftSchema>

function collectActionIds(body: {
  [K in (typeof MONSTER_ACTION_SECTIONS)[number]]?: readonly { id?: string }[]
}): string[] {
  return MONSTER_ACTION_SECTIONS.flatMap((section) =>
    (body[section] ?? []).flatMap((action) => (action.id ? [action.id] : [])),
  )
}

function refineMonsterProficiencies(
  proficiencies: MonsterBody['proficiencies'],
  ctx: z.RefinementCtx,
  prefix: (string | number)[],
): void {
  const seenLanguages = new Set<string>()
  proficiencies.languages.forEach((entry, index) => {
    if (seenLanguages.has(entry.language)) {
      addCustomRefinementIssue(ctx, 'Language ids must be unique.', [
        ...prefix,
        'proficiencies',
        'languages',
        index,
        'language',
      ])
    }
    seenLanguages.add(entry.language)
  })

  const seenWeaponIds = new Set<string>()
  const seenWeaponCategories = new Set<string>()
  proficiencies.weapons.forEach((target, index) => {
    if (target.weaponId !== undefined) {
      if (seenWeaponIds.has(target.weaponId)) {
        addCustomRefinementIssue(ctx, 'Weapon proficiency targets must be unique.', [
          ...prefix,
          'proficiencies',
          'weapons',
          index,
          'weaponId',
        ])
      }
      seenWeaponIds.add(target.weaponId)
    }
    if (target.weaponCategory !== undefined) {
      if (seenWeaponCategories.has(target.weaponCategory)) {
        addCustomRefinementIssue(ctx, 'Weapon proficiency targets must be unique.', [
          ...prefix,
          'proficiencies',
          'weapons',
          index,
          'weaponCategory',
        ])
      }
      seenWeaponCategories.add(target.weaponCategory)
    }
  })
}

function refineUniqueTraitPresets(
  traits: readonly object[],
  ctx: z.RefinementCtx,
  path: (string | number)[],
): void {
  const seen = new Set<string>()
  traits.forEach((trait, index) => {
    const preset = 'preset' in trait && typeof trait.preset === 'string' ? trait.preset : undefined
    const templateId =
      'templateId' in trait && typeof trait.templateId === 'string' ? trait.templateId : undefined
    const key = preset ?? templateId
    if (!key) return
    if (seen.has(key)) {
      addCustomRefinementIssue(ctx, 'Trait presets must be unique.', [
        ...path,
        index,
        preset ? 'preset' : 'templateId',
      ])
    }
    seen.add(key)
  })
}

function refineUniqueIds(
  ids: readonly string[],
  ctx: z.RefinementCtx,
  path: (string | number)[],
  message: string,
): void {
  const seen = new Set<string>()
  ids.forEach((id, index) => {
    if (seen.has(id)) {
      addCustomRefinementIssue(ctx, message, [...path, index, 'id'])
    }
    seen.add(id)
  })
}

const MULTIATTACK_ATTACK_KINDS = new Set(['weapon', 'natural-weapon', 'attack'])
const LEGENDARY_REFERENCE_KINDS = new Set(['weapon', 'natural-weapon', 'attack', 'save', 'special'])

type ActionReferenceRow = {
  id?: string
  kind: string
  steps?: readonly { actionIds?: readonly string[] }[]
  actionIds?: readonly string[]
  followUpActionId?: string
  trigger?: { text?: string }
}

type ReferenceIdMessages = {
  self?: string
  duplicate: string
  missing: string
  invalidKind: string
}

function refineReferencedIdList(
  ownerId: string | undefined,
  actionIds: readonly string[],
  actionsById: ReadonlyMap<string, { kind: string }>,
  ctx: z.RefinementCtx,
  idPath: (idIndex: number) => (string | number)[],
  allowedKinds: ReadonlySet<string>,
  messages: ReferenceIdMessages,
  seen: Set<string>,
): void {
  const listSeen = new Set<string>()
  actionIds.forEach((id, idIndex) => {
    const path = idPath(idIndex)
    if (messages.self && id === ownerId) {
      addCustomRefinementIssue(ctx, messages.self, path)
    }
    if (listSeen.has(id) || seen.has(id)) {
      addCustomRefinementIssue(ctx, messages.duplicate, path)
    }
    listSeen.add(id)
    seen.add(id)
    const target = actionsById.get(id)
    if (!target) {
      addCustomRefinementIssue(ctx, messages.missing, path)
      return
    }
    if (!allowedKinds.has(target.kind)) {
      addCustomRefinementIssue(ctx, messages.invalidKind, path)
    }
  })
}

function refineMultiattackReferences(
  body: {
    actions: readonly ActionReferenceRow[]
    bonusActions: readonly ActionReferenceRow[]
    reactions: readonly ActionReferenceRow[]
    legendaryActions?: readonly ActionReferenceRow[]
  },
  ctx: z.RefinementCtx,
  prefix: (string | number)[],
  options: { published: boolean },
): void {
  const actionsById = new Map(
    body.actions.flatMap((action) => (action.id ? [[action.id, action] as const] : [])),
  )
  const sections = [
    ['actions', body.actions],
    ['bonusActions', body.bonusActions],
    ['reactions', body.reactions],
    ['legendaryActions', body.legendaryActions ?? []],
  ] as const
  for (const [section, entries] of sections) {
    entries.forEach((action, index) => {
      refineOneActionReference(
        action,
        section,
        [...prefix, section, index],
        actionsById,
        ctx,
        options,
      )
    })
  }
}

function refineOneActionReference(
  action: ActionReferenceRow,
  section: string,
  path: (string | number)[],
  actionsById: ReadonlyMap<string, { kind: string }>,
  ctx: z.RefinementCtx,
  options: { published: boolean },
): void {
  if (action.kind === 'multiattack') {
    refineMultiattackRow(action, section, path, actionsById, ctx)
    return
  }
  if (action.kind === 'parry') {
    refineParryFollowUp(action, path, actionsById, ctx, options.published)
    return
  }
  if (action.kind === 'action-reference' && section === 'reactions') {
    refineReactionActionReference(action, path, actionsById, ctx, options.published)
    return
  }
  if (action.kind !== 'action-reference' || section !== 'legendaryActions') return
  refineLegendaryActionReference(action, path, actionsById, ctx)
}

function refineMultiattackRow(
  action: ActionReferenceRow,
  section: string,
  path: (string | number)[],
  actionsById: ReadonlyMap<string, { kind: string }>,
  ctx: z.RefinementCtx,
): void {
  if (section !== 'actions') {
    addCustomRefinementIssue(ctx, 'Multiattack is only valid in Actions.', [...path, 'kind'])
    return
  }
  const seen = new Set<string>()
  const steps = Array.isArray(action.steps) ? action.steps : []
  steps.forEach((step, stepIndex) => {
    refineReferencedIdList(
      action.id,
      Array.isArray(step.actionIds) ? step.actionIds : [],
      actionsById,
      ctx,
      (idIndex) => [...path, 'steps', stepIndex, 'actionIds', idIndex],
      MULTIATTACK_ATTACK_KINDS,
      {
        self: 'A multiattack cannot reference itself.',
        duplicate: 'Each attack can be referenced only once.',
        missing: 'must reference an action in Actions',
        invalidKind: 'invalid kind',
      },
      seen,
    )
  })
}

function refineParryFollowUp(
  action: ActionReferenceRow,
  path: (string | number)[],
  actionsById: ReadonlyMap<string, { kind: string }>,
  ctx: z.RefinementCtx,
  published: boolean,
): void {
  if (!published || !action.followUpActionId) return
  refineReferencedIdList(
    action.id,
    [action.followUpActionId],
    actionsById,
    ctx,
    () => [...path, 'followUpActionId'],
    MULTIATTACK_ATTACK_KINDS,
    {
      duplicate: 'Choose an attack from Actions.',
      missing: 'Choose an attack from Actions.',
      invalidKind: 'Choose an attack from Actions.',
    },
    new Set(),
  )
}

function refineReactionActionReference(
  action: ActionReferenceRow,
  path: (string | number)[],
  actionsById: ReadonlyMap<string, { kind: string }>,
  ctx: z.RefinementCtx,
  published: boolean,
): void {
  if (!published) return
  refineReferencedIdList(
    action.id,
    Array.isArray(action.actionIds) ? action.actionIds : [],
    actionsById,
    ctx,
    (idIndex) => [...path, 'actionIds', idIndex],
    LEGENDARY_REFERENCE_KINDS,
    {
      duplicate: 'Each action can be chosen only once.',
      missing: 'Choose an attack or ability from Actions.',
      invalidKind: "This action can't be used by a reaction.",
    },
    new Set(),
  )
}

function refineLegendaryActionReference(
  action: ActionReferenceRow,
  path: (string | number)[],
  actionsById: ReadonlyMap<string, { kind: string }>,
  ctx: z.RefinementCtx,
): void {
  const actionIds = Array.isArray(action.actionIds) ? action.actionIds : []
  refineReferencedIdList(
    action.id,
    actionIds,
    actionsById,
    ctx,
    (idIndex) => [...path, 'actionIds', idIndex],
    LEGENDARY_REFERENCE_KINDS,
    {
      duplicate: 'Each action can be chosen only once.',
      missing: 'Choose an attack or ability from Actions.',
      invalidKind: "This action can't be used by a legendary action.",
    },
    new Set(),
  )
  if (actionIds.length < 2) return
  actionIds.forEach((id, idIndex) => {
    const target = actionsById.get(id)
    if (!target || !LEGENDARY_REFERENCE_KINDS.has(target.kind)) return
    if (MULTIATTACK_ATTACK_KINDS.has(target.kind)) return
    addCustomRefinementIssue(ctx, 'Only attacks can be offered as a choice.', [
      ...path,
      'actionIds',
      idIndex,
    ])
  })
}

function refineLegendaryActionPool(
  body: {
    legendaryActions: readonly unknown[]
    legendaryActionUses?: number
    legendaryActionUsesInLair?: number
  },
  ctx: z.RefinementCtx,
  prefix: (string | number)[],
): void {
  const hasRows = body.legendaryActions.length > 0
  if (!hasRows) {
    if (body.legendaryActionUses !== undefined) {
      addCustomRefinementIssue(ctx, 'Legendary action uses require a legendary action.', [
        ...prefix,
        'legendaryActionUses',
      ])
    }
    if (body.legendaryActionUsesInLair !== undefined) {
      addCustomRefinementIssue(ctx, 'In-lair legendary action uses require a legendary action.', [
        ...prefix,
        'legendaryActionUsesInLair',
      ])
    }
    return
  }
  if (body.legendaryActionUses === undefined) {
    addCustomRefinementIssue(ctx, 'Enter legendary action uses.', [
      ...prefix,
      'legendaryActionUses',
    ])
    return
  }
  if (
    body.legendaryActionUsesInLair !== undefined &&
    body.legendaryActionUsesInLair <= body.legendaryActionUses
  ) {
    addCustomRefinementIssue(ctx, 'In-lair uses must be greater than legendary action uses.', [
      ...prefix,
      'legendaryActionUsesInLair',
    ])
  }
}

function refineWeaponEntryReferences(
  body: {
    equipment: readonly { entryId: string }[]
    actions: readonly { kind: string; equipmentEntryId?: string }[]
    bonusActions: readonly { kind: string; equipmentEntryId?: string }[]
    reactions: readonly { kind: string; equipmentEntryId?: string }[]
    legendaryActions: readonly { kind: string; equipmentEntryId?: string }[]
  },
  ctx: z.RefinementCtx,
  prefix: (string | number)[],
  options: { requirePresent: boolean },
): void {
  const equipmentByEntryId = new Set(body.equipment.map((entry) => entry.entryId))
  for (const section of MONSTER_ACTION_SECTIONS) {
    for (const [index, action] of body[section].entries()) {
      if (action.kind !== 'weapon') continue
      const equipmentEntryId = action.equipmentEntryId
      if (!equipmentEntryId) {
        if (options.requirePresent) {
          addCustomRefinementIssue(ctx, 'Weapon action must reference an equipment entry.', [
            ...prefix,
            section,
            index,
            'equipmentEntryId',
          ])
        }
        continue
      }
      if (!equipmentByEntryId.has(equipmentEntryId)) {
        addCustomRefinementIssue(ctx, 'Weapon action must reference an equipment entry.', [
          ...prefix,
          section,
          index,
          'equipmentEntryId',
        ])
      }
    }
  }
}

function refinePublishedReactionTrigger(
  action: { kind: string; trigger?: { text?: string } },
  section: string,
  path: (string | number)[],
  ctx: z.RefinementCtx,
): void {
  if (section !== 'reactions') return
  if (action.kind !== 'special' && action.kind !== 'action-reference') return
  if (action.trigger?.text?.trim()) return
  addCustomRefinementIssue(ctx, 'Trigger is required.', [...path, 'trigger'])
}

export function refineMonsterBody(
  body: MonsterBody,
  ctx: z.RefinementCtx,
  prefix: (string | number)[] = [],
): void {
  const entryIds = body.equipment.map((entry) => entry.entryId)
  if (new Set(entryIds).size !== entryIds.length) {
    addCustomRefinementIssue(ctx, 'Equipment entry ids must be unique.', [...prefix, 'equipment'])
  }

  refineUniqueIds(
    body.traits.map((trait) => trait.id),
    ctx,
    [...prefix, 'traits'],
    'Trait ids must be unique.',
  )
  refineUniqueTraitPresets(body.traits, ctx, [...prefix, 'traits'])

  const actionIds = collectActionIds(body)
  if (new Set(actionIds).size !== actionIds.length) {
    addCustomRefinementIssue(ctx, 'Action ids must be unique across all sections.', [
      ...prefix,
      'actions',
    ])
  }

  for (const section of MONSTER_ACTION_SECTIONS) {
    for (const [index, action] of body[section].entries()) {
      const path = [...prefix, section, index]
      refineMonsterActionShape(action, ctx, path)
      refinePublishedReactionTrigger(action, section, path, ctx)
    }
  }
  refineMonsterSpellEntries(body, ctx, prefix, { published: true })
  body.traits.forEach((trait, index) => {
    if (!('savingThrow' in trait) || !trait.savingThrow) return
    const source = trait.savingThrow.dcSource
    if (source.kind !== 'spellcasting' || source.castingAbility.kind !== 'shared') return
    if (findSpellCastingSource(body, source.castingAbility.entryId)) return
    addCustomRefinementIssue(
      ctx,
      'Shared spellcasting must use another spell entry that has its own ability.',
      [...prefix, 'traits', index, 'savingThrow', 'dcSource', 'castingAbility', 'entryId'],
    )
  })

  refineWeaponEntryReferences(body, ctx, prefix, { requirePresent: true })
  refineMultiattackReferences(body, ctx, prefix, { published: true })
  refineLegendaryActionPool(body, ctx, prefix)
  refineCreatureDamageDefenses(body.defenses, ctx, [...prefix, 'defenses'])
  refineCreatureSenseRanges(body.senses, ctx, [...prefix, 'senses'])
  refineCreatureTelepathyRange(body.communication.telepathy, ctx, [
    ...prefix,
    'communication',
    'telepathy',
  ])
  refineMonsterProficiencies(body.proficiencies, ctx, prefix)
  const derivedXp = CHALLENGE_RATING_MECHANICS[body.challengeRating].xp
  if (body.experiencePointsOverride !== undefined) {
    if (body.challengeRating !== '0') {
      addCustomRefinementIssue(
        ctx,
        'Experience point override is only allowed for challenge rating 0.',
        [...prefix, 'experiencePointsOverride'],
      )
    } else if (body.experiencePointsOverride === derivedXp) {
      addCustomRefinementIssue(
        ctx,
        'Experience point override must differ from the derived CR 0 value.',
        [...prefix, 'experiencePointsOverride'],
      )
    }
  }
}

/** Stored monster record — explicit meta + body (Zod superRefine omits output typing). */
export type Monster = ContentMeta & MonsterBody

const monsterStoredSchema = publishStoredSchema(monsterBodySchema).superRefine((monster, ctx) =>
  refineMonsterBody(monster as MonsterBody, ctx),
)

export const monsterSchema = monsterStoredSchema as unknown as z.ZodType<Monster>

function refineMonsterDraftIds(
  body: MonsterBodyDraft,
  ctx: z.RefinementCtx,
  prefix: (string | number)[],
): void {
  const equipment = body.equipment ?? []
  const entryIds = equipment.map((entry) => entry.entryId)
  if (new Set(entryIds).size !== entryIds.length) {
    addCustomRefinementIssue(ctx, 'Equipment entry ids must be unique.', [...prefix, 'equipment'])
  }

  refineUniqueIds(
    (body.traits ?? []).map((trait) => trait.id),
    ctx,
    [...prefix, 'traits'],
    'Trait ids must be unique.',
  )
  refineUniqueTraitPresets(body.traits ?? [], ctx, [...prefix, 'traits'])

  const actionIds = collectActionIds({
    actions: body.actions ?? [],
    bonusActions: body.bonusActions ?? [],
    reactions: body.reactions ?? [],
    legendaryActions: body.legendaryActions ?? [],
  })
  if (new Set(actionIds).size !== actionIds.length) {
    addCustomRefinementIssue(ctx, 'Action ids must be unique across all sections.', [
      ...prefix,
      'actions',
    ])
  }
}

function draftActionSections(body: MonsterBodyDraft) {
  return {
    actions: body.actions ?? [],
    bonusActions: body.bonusActions ?? [],
    reactions: body.reactions ?? [],
    legendaryActions: body.legendaryActions ?? [],
  }
}

function refineMonsterDraftBody(
  body: MonsterBodyDraft,
  ctx: z.RefinementCtx,
  prefix: (string | number)[] = [],
): void {
  const sections = draftActionSections(body)
  refineMonsterDraftIds(body, ctx, prefix)
  refineMonsterSpellEntries(sections, ctx, prefix)
  refineWeaponEntryReferences({ equipment: body.equipment ?? [], ...sections }, ctx, prefix, {
    requirePresent: false,
  })
  refineMultiattackReferences(sections, ctx, prefix, { published: false })
}

const monsterDraftStoredSchemaBase = draftStoredSchema(monsterBodyDraftSchema).superRefine(
  (monster, ctx) => refineMonsterDraftBody(monster as MonsterBodyDraft, ctx),
)

export const monsterDraftStoredSchema = monsterDraftStoredSchemaBase

export type MonsterDraft = z.infer<typeof monsterDraftStoredSchema>

const monsterPublishInputSchema = createPublishInputSchema(monsterBodySchema)
const monsterDraftInputSchema = createDraftInputSchema(monsterBodyDraftSchema)

/** Publish create DTO — explicit shape so Zod `extend` / `superRefine` do not widen trait output. */
export type CreateMonsterInput = MonsterBody & { slug: Slug }

export const createMonsterInputSchema = monsterPublishInputSchema.superRefine((input, ctx) =>
  refineMonsterBody(input as MonsterBody, ctx),
)

export type CreateMonsterDraftInput = MonsterBodyDraft & { slug: Slug }

export const createMonsterDraftInputSchema = monsterDraftInputSchema.superRefine((input, ctx) =>
  refineMonsterDraftBody(input as MonsterBodyDraft, ctx),
)

export const updateMonsterInputSchema = monsterPublishInputSchema.partial().extend({
  experiencePointsOverride: z.number().int().min(0).nullable().optional(),
  hover: z.boolean().nullable().optional(),
  description: z.string().nullable().optional(),
})

export type UpdateMonsterInput = z.infer<typeof updateMonsterInputSchema>

export const updateMonsterDraftInputSchema = monsterDraftInputSchema
  .partial()
  .superRefine((input, ctx) => refineMonsterDraftBody(input as MonsterBodyDraft, ctx))

export {
  collectMonsterCatalogIssues,
  MONSTER_CATALOG_ISSUE_CODE,
} from './monster/monster-catalog-issues'
export type {
  MonsterCatalogIssueBody,
  MonsterCatalogIssueCode,
  MonsterCatalogs,
} from './monster/monster-catalog-issues'

export type UpdateMonsterDraftInput = z.infer<typeof updateMonsterDraftInputSchema>

export const monsterPatchSchema = contentPatchBaseSchema.extend({
  patch: monsterBodySchema.partial(),
})

export type MonsterPatch = z.infer<typeof monsterPatchSchema>
