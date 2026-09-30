import { getNpcTemplateEntry } from '../../../vocab/npc/npc-template'
import { toEquipmentContentId } from '../../creature/equipment'
import type { AutomaticNpcBuildConstraints } from '../automatic/automatic-npc-build-constraints'
import { normalizeAutomaticNpcBuildConstraints } from '../automatic/automatic-npc-build-constraints'
import type { AutomaticNpcBuildPreferences } from '../automatic/automatic-npc-build-seed'
import type { AutomaticNpcBuildSeed } from '../automatic/automatic-npc-build-seed'
import {
  levelZeroBaselineLanguageIds,
  levelZeroSpeciesLanguageIds,
} from '../assembly/level-zero-baseline-proficiency-entries'
import type { ChoiceSet, ChoiceSetOwnerKind } from '../choice-set'
import {
  indexCharacterBuildCatalog,
  type CharacterBuildCatalogIndex,
  type CharacterBuildContext,
} from '../context'
import { createEmptyCharacterBuilderDraft } from '../draft/draft'
import {
  isBuilderLevelZeroClassless,
  isClassProgressionApplicable,
} from '../progression/character-level-policy'
import { resolveAvailableChoices } from '../resolvers/registry/resolve-choices'
import type { NpcRecommendationSource } from './resolve-npc-template-recommendations'

export const NPC_STARTING_CHOICE_KINDS = [
  'skill',
  'tool',
  'language',
  'equipment',
  'weapon',
  'spell',
] as const

export type NpcStartingChoiceKind = (typeof NPC_STARTING_CHOICE_KINDS)[number]

export const NPC_STARTING_CHOICE_OWNERSHIPS = ['fixed-grant', 'allowance-fill', 'manual'] as const

export type NpcStartingChoiceOwnership = (typeof NPC_STARTING_CHOICE_OWNERSHIPS)[number]

export type NpcStartingChoiceProvenance = {
  ownerKind?: ChoiceSetOwnerKind
  ownerLabel?: string
  suggestionOwnerLabel?: string
  suggestedBy?: NpcRecommendationSource
}

export type NpcStartingChoiceEntry = {
  kind: NpcStartingChoiceKind
  ownership: NpcStartingChoiceOwnership
  selectedIds: readonly string[]
  allowance?: { chosen: number; required: number }
  provenance: NpcStartingChoiceProvenance
  choiceSetId?: string
  editable: boolean
  overridden: boolean
}

export type NpcStartingChoices = {
  entries: readonly NpcStartingChoiceEntry[]
}

const ALLOWANCE_CHOICE_TYPES = new Set<ChoiceSet['choiceType']>([
  'skillProficiency',
  'toolProficiency',
  'language',
])

function optionIdentityKeys(optionId: string): string[] {
  const keys = [optionId]
  const separator = optionId.lastIndexOf(':')
  if (separator >= 0) keys.push(optionId.slice(separator + 1))
  return keys
}

function idsOverlap(left: string, right: string): boolean {
  const rightKeys = new Set(optionIdentityKeys(right))
  return optionIdentityKeys(left).some((key) => rightKeys.has(key))
}

function isHeld(id: string, heldKeys: ReadonlySet<string>): boolean {
  return optionIdentityKeys(id).some((key) => heldKeys.has(key))
}

function matchOptionId(choiceSet: ChoiceSet, idOrSlug: string): string | undefined {
  return choiceSet.options.find((option) => optionIdentityKeys(option.id).includes(idOrSlug))?.id
}

function kindForChoiceSet(choiceSet: ChoiceSet): NpcStartingChoiceKind | undefined {
  if (choiceSet.choiceType === 'skillProficiency') return 'skill'
  if (choiceSet.choiceType === 'toolProficiency') return 'tool'
  if (choiceSet.choiceType === 'language') return 'language'
  return undefined
}

function preferenceIdsForKind(
  kind: NpcStartingChoiceKind,
  preferences: AutomaticNpcBuildPreferences | undefined,
): readonly string[] {
  if (!preferences) return []
  if (kind === 'skill') return preferences.skillSlugs ?? []
  if (kind === 'tool') return preferences.toolSlugs ?? []
  if (kind === 'language') return preferences.languageIds ?? []
  return []
}

function rememberHeld(heldKeys: Set<string>, id: string): void {
  for (const key of optionIdentityKeys(id)) heldKeys.add(key)
}

/**
 * Complete fill for one allowance. An override is used as-is after eligibility
 * clamping and is never padded with recommendation ids.
 */
// fallow-ignore-next-line complexity
export function resolveNpcStartingChoiceAllowances(args: {
  choiceSets: readonly ChoiceSet[]
  overrides?: Record<string, readonly string[]>
  preferences?: AutomaticNpcBuildPreferences
  suggestionOwnerLabel?: string
  heldKeys?: ReadonlySet<string>
}): NpcStartingChoiceEntry[] {
  const heldKeys = new Set(args.heldKeys ?? [])
  const entries: NpcStartingChoiceEntry[] = []

  for (const choiceSet of args.choiceSets) {
    const kind = kindForChoiceSet(choiceSet)
    if (!kind || !ALLOWANCE_CHOICE_TYPES.has(choiceSet.choiceType)) continue
    if (choiceSet.min <= 0) continue

    const override = args.overrides?.[choiceSet.id]
    const overridden = override !== undefined
    const selectedIds: string[] = []

    if (overridden) {
      for (const rawId of override) {
        const optionId = matchOptionId(choiceSet, rawId)
        if (!optionId || selectedIds.includes(optionId) || isHeld(optionId, heldKeys)) continue
        selectedIds.push(optionId)
        if (selectedIds.length >= choiceSet.max) break
      }
    } else {
      for (const rawId of preferenceIdsForKind(kind, args.preferences)) {
        if (selectedIds.length >= choiceSet.min) break
        const optionId = matchOptionId(choiceSet, rawId)
        if (!optionId || selectedIds.includes(optionId) || isHeld(optionId, heldKeys)) continue
        selectedIds.push(optionId)
      }
      for (const option of choiceSet.options) {
        if (selectedIds.length >= choiceSet.min) break
        if (selectedIds.includes(option.id) || isHeld(option.id, heldKeys)) continue
        selectedIds.push(option.id)
      }
    }

    for (const id of selectedIds) rememberHeld(heldKeys, id)

    entries.push({
      kind,
      ownership: 'allowance-fill',
      selectedIds,
      allowance: { chosen: selectedIds.length, required: choiceSet.min },
      provenance: {
        ownerKind: choiceSet.provenance?.ownerKind,
        ownerLabel: choiceSet.provenance?.ownerLabel,
        ...(!overridden && args.suggestionOwnerLabel
          ? { suggestionOwnerLabel: args.suggestionOwnerLabel, suggestedBy: 'template' as const }
          : {}),
      },
      choiceSetId: choiceSet.id,
      editable: true,
      overridden,
    })
  }

  return entries
}

function seedDraftForChoices(
  seed: Pick<AutomaticNpcBuildSeed, 'speciesId' | 'classId' | 'level' | 'npcTemplateId'>,
): ReturnType<typeof createEmptyCharacterBuilderDraft> {
  const empty = createEmptyCharacterBuilderDraft()
  return {
    ...empty,
    species: { speciesId: seed.speciesId },
    class: {
      ...(seed.classId && isClassProgressionApplicable(seed.level)
        ? { classId: seed.classId }
        : {}),
      level: seed.level,
    },
    ...(seed.npcTemplateId ? { npcTemplateId: seed.npcTemplateId } : {}),
  }
}

function fixedLanguageEntries(args: {
  context: CharacterBuildContext
  catalogIndex: CharacterBuildCatalogIndex
  draft: ReturnType<typeof seedDraftForChoices>
}): NpcStartingChoiceEntry[] {
  if (!isBuilderLevelZeroClassless(args.draft, args.context)) return []

  const rules = args.context.characterCreationRules.levelZeroNpcs
  const species = args.draft.species.speciesId
    ? args.catalogIndex.species.get(args.draft.species.speciesId)
    : undefined
  const entries: NpcStartingChoiceEntry[] = []
  const baseline = levelZeroBaselineLanguageIds(rules, args.context.catalog.languages)
  if (baseline.length > 0) {
    entries.push({
      kind: 'language',
      ownership: 'fixed-grant',
      selectedIds: baseline,
      provenance: { ownerKind: 'campaign', ownerLabel: 'Level 0' },
      editable: false,
      overridden: false,
    })
  }
  const speciesLanguages = levelZeroSpeciesLanguageIds(species, rules)
  if (speciesLanguages.length > 0) {
    entries.push({
      kind: 'language',
      ownership: 'fixed-grant',
      selectedIds: speciesLanguages,
      provenance: { ownerKind: 'species', ownerLabel: species?.name },
      editable: false,
      overridden: false,
    })
  }
  return entries
}

function fixedKitEntry(args: {
  context: CharacterBuildContext
  catalogIndex: CharacterBuildCatalogIndex
  draft: ReturnType<typeof seedDraftForChoices>
}): NpcStartingChoiceEntry | undefined {
  if (!isBuilderLevelZeroClassless(args.draft, args.context)) return undefined
  const templateId = args.draft.npcTemplateId
  const template = templateId ? getNpcTemplateEntry(templateId) : undefined
  const kit = template?.levelZero?.kit ?? []
  if (!template || kit.length === 0) return undefined

  const selectedIds: string[] = []
  for (const item of kit) {
    const equipmentId = toEquipmentContentId(args.context.rulesetId, item.slug)
    if (!args.catalogIndex.equipment.has(equipmentId)) continue
    if (selectedIds.some((id) => idsOverlap(id, equipmentId))) continue
    selectedIds.push(equipmentId)
  }
  if (selectedIds.length === 0) return undefined

  return {
    kind: 'equipment',
    ownership: 'fixed-grant',
    selectedIds,
    provenance: { ownerKind: 'npcTemplate', ownerLabel: template.label },
    editable: false,
    overridden: false,
  }
}

function manualEntry(args: {
  kind: 'weapon' | 'spell'
  ids: readonly string[]
  satisfiedIds: readonly string[]
}): NpcStartingChoiceEntry | undefined {
  const selectedIds: string[] = []
  for (const id of args.ids) {
    if (args.satisfiedIds.some((satisfied) => idsOverlap(satisfied, id))) continue
    if (selectedIds.some((selected) => idsOverlap(selected, id))) continue
    selectedIds.push(id)
  }
  if (selectedIds.length === 0) return undefined
  return {
    kind: args.kind,
    ownership: 'manual',
    selectedIds,
    provenance: {},
    editable: true,
    overridden: false,
  }
}

// fallow-ignore-next-line complexity
export function resolveNpcStartingChoices(args: {
  context: CharacterBuildContext
  seed: Pick<AutomaticNpcBuildSeed, 'speciesId' | 'classId' | 'level' | 'npcTemplateId'>
  startingChoiceOverrides?: Record<string, readonly string[]>
  requiredWeaponIds?: readonly string[]
  requiredSpellIds?: readonly string[]
  preferences?: AutomaticNpcBuildPreferences
  suggestionOwnerLabel?: string
}): NpcStartingChoices {
  const catalogIndex = indexCharacterBuildCatalog(args.context.catalog)
  const draft = seedDraftForChoices(args.seed)
  const choiceSets = resolveAvailableChoices(draft, args.context)
  const languages = fixedLanguageEntries({ context: args.context, catalogIndex, draft })
  const heldKeys = new Set<string>()
  for (const entry of languages) {
    for (const id of entry.selectedIds) rememberHeld(heldKeys, id)
  }

  const allowances = resolveNpcStartingChoiceAllowances({
    choiceSets,
    overrides: args.startingChoiceOverrides,
    preferences: args.preferences,
    suggestionOwnerLabel: args.suggestionOwnerLabel,
    heldKeys,
  })
  const kit = fixedKitEntry({ context: args.context, catalogIndex, draft })
  const satisfiedIds = [
    ...(kit?.selectedIds ?? []),
    ...allowances.flatMap((entry) => entry.selectedIds),
    ...languages.flatMap((entry) => entry.selectedIds),
  ]
  const weapon = manualEntry({
    kind: 'weapon',
    ids: args.requiredWeaponIds ?? [],
    satisfiedIds,
  })
  const spell = manualEntry({
    kind: 'spell',
    ids: args.requiredSpellIds ?? [],
    satisfiedIds: [...satisfiedIds, ...(weapon?.selectedIds ?? [])],
  })

  return {
    entries: [
      ...languages,
      ...allowances,
      ...(kit ? [kit] : []),
      ...(weapon ? [weapon] : []),
      ...(spell ? [spell] : []),
    ],
  }
}

/** Drops overrides whose choice-set id is no longer an active allowance. */
export function pruneNpcStartingChoiceOverrides(
  overrides: Record<string, readonly string[]>,
  activeChoiceSetIds: ReadonlySet<string>,
): Record<string, string[]> {
  const next: Record<string, string[]> = {}
  for (const [choiceSetId, selectedIds] of Object.entries(overrides)) {
    if (!activeChoiceSetIds.has(choiceSetId)) continue
    next[choiceSetId] = [...selectedIds]
  }
  return next
}

export function npcStartingChoiceAllowanceIds(choices: NpcStartingChoices): string[] {
  return choices.entries.flatMap((entry) => (entry.choiceSetId ? [entry.choiceSetId] : []))
}

/** Complete allowance fills to seed before automatic top-up. Short overrides are omitted. */
export function npcStartingChoiceAllowanceSelections(
  choices: NpcStartingChoices,
): Record<string, string[]> {
  const selections: Record<string, string[]> = {}
  for (const entry of choices.entries) {
    if (entry.ownership !== 'allowance-fill' || !entry.choiceSetId || !entry.allowance) continue
    if (entry.allowance.chosen < entry.allowance.required) continue
    selections[entry.choiceSetId] = [...entry.selectedIds]
  }
  return selections
}

export function npcStartingChoiceManualConstraints(
  choices: NpcStartingChoices,
): AutomaticNpcBuildConstraints | undefined {
  const weapons = choices.entries.find(
    (entry) => entry.kind === 'weapon' && entry.ownership === 'manual',
  )
  const spells = choices.entries.find(
    (entry) => entry.kind === 'spell' && entry.ownership === 'manual',
  )
  return normalizeAutomaticNpcBuildConstraints({
    requiredWeaponIds: weapons ? [...weapons.selectedIds] : [],
    requiredSpellIds: spells ? [...spells.selectedIds] : [],
  })
}

export function npcStartingChoiceIncompleteOverride(
  choices: NpcStartingChoices,
): NpcStartingChoiceEntry | undefined {
  return choices.entries.find(
    (entry) =>
      entry.overridden &&
      entry.allowance !== undefined &&
      entry.allowance.chosen < entry.allowance.required,
  )
}
