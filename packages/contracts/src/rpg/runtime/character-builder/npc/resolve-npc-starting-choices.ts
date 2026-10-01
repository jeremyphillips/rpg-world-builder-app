import { assembleCharacterProficiencies } from '../assembly/assemble-proficiencies'
import { assembleLevelZeroStartingEquipment } from '../assembly/assemble-level-zero-starting-equipment'
import type { AutomaticNpcBuildConstraints } from '../automatic/automatic-npc-build-constraints'
import { normalizeAutomaticNpcBuildConstraints } from '../automatic/automatic-npc-build-constraints'
import type { AutomaticNpcBuildPreferences } from '../automatic/automatic-npc-build-seed'
import { resolveAutomaticChoiceSelections } from '../automatic/resolve-automatic-choice-selections'
import { seedAutomaticChoiceDraft } from '../automatic/resolve-automatic-npc-build'
import type { ChoiceSet, ChoiceSetProvenance } from '../choice-set'
import { buildChoiceSetId } from '../choice-set'
import { indexCharacterBuildCatalog, type CharacterBuildContext } from '../context'
import type { CharacterBuilderDraft } from '../draft/draft'
import { optionIdentitiesOverlap } from '../option-identity'
import { isBuilderLevelZeroClassless } from '../progression/character-level-policy'
import {
  buildSelectionSourceLabelCatalogIndex,
  resolveSelectionSourceProvenance,
} from '../../character/format-selection-source-label'
import { CHARACTER_EQUIPMENT_INVENTORY_BUCKETS } from '../../character/sheet/equipment-inventory'
import type { CharacterSelectionSource } from '../../character/sheet/selection-sources'
import { inventoryContainsEquipmentId } from '../resolvers/equipment/derive-equipment-draft-entries'
import type { RecommendationSourceRef } from '../recommendation'
import {
  collectFixedGrantPairs,
  groupFixedGrantPairs,
  type FixedGrantStreamCategory,
  type FixedGrantValueStream,
} from './collect-fixed-grant-pairs'

export const STARTING_CHOICE_CATEGORIES = {
  skill: { choiceTypes: ['skillProficiency'], fixedStream: 'proficiencies.skills' },
  tool: { choiceTypes: ['toolProficiency'], fixedStream: 'proficiencies.tools' },
  language: { choiceTypes: ['language'], fixedStream: 'proficiencies.languages' },
  equipment: { choiceTypes: [], fixedStream: 'levelZeroInventory' },
  weapon: { constraint: 'requiredWeaponIds' },
  spell: { constraint: 'requiredSpellIds' },
} as const

export type StartingChoiceCategory = keyof typeof STARTING_CHOICE_CATEGORIES

export type StartingChoiceOwner = Pick<
  ChoiceSetProvenance,
  'ownerKind' | 'ownerLabel' | 'featureLabel'
>

type StartingChoiceContributionBase = {
  id: string
  category: StartingChoiceCategory
  owner: StartingChoiceOwner
  selectedIds: readonly string[]
}

export type StartingChoiceContribution = StartingChoiceContributionBase &
  (
    | {
        mechanic: 'fixed-grant'
        source: CharacterSelectionSource
        quantities?: Readonly<Record<string, number>>
      }
    | {
        mechanic: 'choice-allowance'
        choiceSetId: string
        allowance: { min: number; max: number }
        overridden: boolean
        /** Traced by the fill. Absent for overridden allowances. [] = canonical order. */
        suggestedBy?: Readonly<Record<string, readonly RecommendationSourceRef[]>>
      }
    | {
        mechanic: 'explicit-constraint'
        constraint: 'requiredWeaponIds' | 'requiredSpellIds'
      }
  )

export type NpcStartingChoices = {
  contributions: readonly StartingChoiceContribution[]
  removedOverrideIds: readonly string[]
  /** Pass B draft. The picker applies a local fill on top of this. */
  draft: CharacterBuilderDraft
  resolvedChoiceSets: readonly ChoiceSet[]
}

const CATEGORY_ORDER: readonly StartingChoiceCategory[] = [
  'skill',
  'tool',
  'language',
  'equipment',
  'weapon',
  'spell',
]

const ALLOWANCE_CATEGORIES = new Set<StartingChoiceCategory>(['skill', 'tool', 'language'])

function categoryForChoiceSet(choiceSet: ChoiceSet): StartingChoiceCategory | undefined {
  if (choiceSet.choiceType === 'skillProficiency') return 'skill'
  if (choiceSet.choiceType === 'toolProficiency') return 'tool'
  if (choiceSet.choiceType === 'language') return 'language'
  return undefined
}

function isStartingChoiceAllowance(choiceSet: ChoiceSet): boolean {
  const category = categoryForChoiceSet(choiceSet)
  return (
    category !== undefined &&
    ALLOWANCE_CATEGORIES.has(category) &&
    choiceSet.required &&
    choiceSet.min > 0
  )
}

function ownerFromChoiceSet(choiceSet: ChoiceSet): StartingChoiceOwner {
  const provenance = choiceSet.provenance
  return {
    ...(provenance?.ownerKind ? { ownerKind: provenance.ownerKind } : {}),
    ...(provenance?.ownerLabel ? { ownerLabel: provenance.ownerLabel } : {}),
    ...(provenance?.featureLabel ? { featureLabel: provenance.featureLabel } : {}),
  }
}

function ownerFromSource(
  source: CharacterSelectionSource,
  context: CharacterBuildContext,
  catalogIndex: ReturnType<typeof indexCharacterBuildCatalog>,
): StartingChoiceOwner {
  const labelCatalog = buildSelectionSourceLabelCatalogIndex({
    catalogIndex,
    characterCreationRules: context.characterCreationRules,
  })
  const resolved = resolveSelectionSourceProvenance(source, labelCatalog)
  const featureLabel =
    resolved.primaryLabel && resolved.primaryLabel !== resolved.ownerLabel
      ? resolved.primaryLabel
      : undefined

  return {
    ...(resolved.ownerKind ? { ownerKind: resolved.ownerKind } : {}),
    ...(resolved.ownerLabel ? { ownerLabel: resolved.ownerLabel } : {}),
    ...(featureLabel ? { featureLabel } : {}),
  }
}

function fixedContributionId(
  category: FixedGrantStreamCategory,
  source: CharacterSelectionSource,
): string {
  return `fixed:${category}:${source.kind}:${source.sourceId ?? ''}:${source.grantId ?? ''}`
}

function dedupeIds(ids: readonly string[]): string[] {
  const selected: string[] = []
  for (const id of ids) {
    if (selected.some((existing) => optionIdentitiesOverlap(existing, id))) continue
    selected.push(id)
  }
  return selected
}

function proficiencyStreams(args: {
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  choiceSets: readonly ChoiceSet[]
}): FixedGrantValueStream[] {
  const catalogIndex = indexCharacterBuildCatalog(args.context.catalog)
  const characterClass = args.draft.class.classId
    ? catalogIndex.classes.get(args.draft.class.classId)
    : undefined
  const proficiencies = assembleCharacterProficiencies(
    args.draft,
    catalogIndex,
    args.choiceSets,
    characterClass,
    args.context,
  )

  return [
    {
      category: 'skill',
      rows: proficiencies.skills.map((entry) => ({
        valueId: entry.skill,
        sources: entry.sources,
      })),
    },
    {
      category: 'tool',
      rows: proficiencies.tools.flatMap((entry) => {
        const valueId =
          entry.toolId ?? (entry.toolCategory ? `category:${entry.toolCategory}` : undefined)
        if (!valueId) return []
        return [{ valueId, sources: entry.sources }]
      }),
    },
    {
      category: 'language',
      rows: proficiencies.languages.map((entry) => ({
        valueId: entry.language,
        sources: entry.sources,
      })),
    },
  ]
}

function levelZeroInventoryStream(args: {
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
}): FixedGrantValueStream {
  if (!isBuilderLevelZeroClassless(args.draft, args.context)) {
    return { category: 'equipment', rows: [] }
  }

  const catalogIndex = indexCharacterBuildCatalog(args.context.catalog)
  const assembled = assembleLevelZeroStartingEquipment(args.draft, {
    rulesetId: args.context.rulesetId,
    levelZeroRules: args.context.characterCreationRules.levelZeroNpcs,
    catalogIndex,
  })
  const rows: FixedGrantValueStream['rows'][number][] = []
  for (const bucket of CHARACTER_EQUIPMENT_INVENTORY_BUCKETS) {
    for (const entry of assembled.equipment[bucket]) {
      rows.push({
        valueId: entry.equipmentId,
        quantity: entry.quantity,
        sources: entry.sources,
      })
    }
  }
  return { category: 'equipment', rows }
}

function levelZeroInventory(args: {
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
}) {
  if (!isBuilderLevelZeroClassless(args.draft, args.context)) return undefined
  const catalogIndex = indexCharacterBuildCatalog(args.context.catalog)
  return assembleLevelZeroStartingEquipment(args.draft, {
    rulesetId: args.context.rulesetId,
    levelZeroRules: args.context.characterCreationRules.levelZeroNpcs,
    catalogIndex,
  }).equipment
}

function withHeritageOption(
  draft: CharacterBuilderDraft,
  speciesId: string,
  heritageOptionId: string | undefined,
): CharacterBuilderDraft {
  if (!heritageOptionId) return draft
  const choiceSetId = buildChoiceSetId('species', speciesId, 'heritage')
  return {
    ...draft,
    species: { ...draft.species, heritageId: heritageOptionId },
    choiceSelections: {
      ...draft.choiceSelections,
      [choiceSetId]: [heritageOptionId],
    },
  }
}

function filterOverrideSelection(
  choiceSet: ChoiceSet,
  selectedIds: readonly string[],
): string[] | undefined {
  const allowed = new Set(choiceSet.options.map((option) => option.id))
  const kept = selectedIds.filter((optionId) => allowed.has(optionId))
  if (kept.length === 0 && selectedIds.length > 0) return undefined
  return kept
}

function pruneOverrides(args: {
  overrides: Record<string, readonly string[]> | undefined
  allowanceSets: readonly ChoiceSet[]
}): { pruned: Record<string, string[]>; removedOverrideIds: string[] } {
  const setsById = new Map(args.allowanceSets.map((choiceSet) => [choiceSet.id, choiceSet]))
  const pruned: Record<string, string[]> = {}
  const removedOverrideIds: string[] = []

  for (const [choiceSetId, selectedIds] of Object.entries(args.overrides ?? {})) {
    const choiceSet = setsById.get(choiceSetId)
    if (!choiceSet) {
      removedOverrideIds.push(choiceSetId)
      continue
    }

    const kept = filterOverrideSelection(choiceSet, selectedIds)
    if (!kept) {
      removedOverrideIds.push(choiceSetId)
      continue
    }
    pruned[choiceSetId] = kept
  }

  return { pruned, removedOverrideIds }
}

function pinNonAllowanceChoiceSetOverrides(args: {
  overrides: Record<string, readonly string[]> | undefined
  choiceSets: readonly ChoiceSet[]
  allowanceSetIds: ReadonlySet<string>
}): { pinned: Record<string, string[]>; pinnedChoiceSetIds: string[] } {
  const setsById = new Map(args.choiceSets.map((choiceSet) => [choiceSet.id, choiceSet]))
  const pinned: Record<string, string[]> = {}
  const pinnedChoiceSetIds: string[] = []

  for (const [choiceSetId, selectedIds] of Object.entries(args.overrides ?? {})) {
    if (args.allowanceSetIds.has(choiceSetId)) continue
    const choiceSet = setsById.get(choiceSetId)
    if (!choiceSet) continue
    const kept = filterOverrideSelection(choiceSet, selectedIds)
    if (!kept || kept.length === 0) continue
    pinned[choiceSetId] = kept
    pinnedChoiceSetIds.push(choiceSetId)
  }

  return { pinned, pinnedChoiceSetIds }
}

function allowanceContributions(args: {
  choiceSets: readonly ChoiceSet[]
  draft: CharacterBuilderDraft
  suggestedBy: Readonly<
    Record<string, Readonly<Record<string, readonly RecommendationSourceRef[]>>>
  >
  overriddenIds: ReadonlySet<string>
}): StartingChoiceContribution[] {
  return args.choiceSets.filter(isStartingChoiceAllowance).map((choiceSet) => {
    const category = categoryForChoiceSet(choiceSet)!
    const overridden = args.overriddenIds.has(choiceSet.id)
    const selectedIds = args.draft.choiceSelections[choiceSet.id] ?? []
    const traced = args.suggestedBy[choiceSet.id]

    return {
      id: choiceSet.id,
      category,
      mechanic: 'choice-allowance' as const,
      owner: ownerFromChoiceSet(choiceSet),
      selectedIds,
      choiceSetId: choiceSet.id,
      allowance: { min: choiceSet.min, max: choiceSet.max },
      overridden,
      ...(!overridden && traced ? { suggestedBy: traced } : {}),
    }
  })
}

function fixedContributions(args: {
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  choiceSets: readonly ChoiceSet[]
}): StartingChoiceContribution[] {
  const catalogIndex = indexCharacterBuildCatalog(args.context.catalog)
  const choiceSetIds = new Set(args.choiceSets.map((choiceSet) => choiceSet.id))
  const pairs = collectFixedGrantPairs(
    [
      ...proficiencyStreams(args),
      levelZeroInventoryStream({ draft: args.draft, context: args.context }),
    ],
    choiceSetIds,
  )

  return groupFixedGrantPairs(pairs).map((group) => {
    const quantities: Record<string, number> = {}
    for (const value of group.values) {
      if (value.quantity !== undefined && value.quantity > 1) {
        quantities[value.valueId] = value.quantity
      }
    }

    return {
      id: fixedContributionId(group.category, group.source),
      category: group.category,
      mechanic: 'fixed-grant' as const,
      owner: ownerFromSource(group.source, args.context, catalogIndex),
      source: group.source,
      selectedIds: group.values.map((value) => value.valueId),
      ...(Object.keys(quantities).length > 0 ? { quantities } : {}),
    }
  })
}

function constraintContributions(args: {
  requiredWeaponIds?: readonly string[]
  requiredSpellIds?: readonly string[]
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
}): StartingChoiceContribution[] {
  const inventory = levelZeroInventory({ draft: args.draft, context: args.context })
  const weapons = dedupeIds(args.requiredWeaponIds ?? []).filter(
    (weaponId) => !inventory || !inventoryContainsEquipmentId(inventory, weaponId),
  )
  const spells = dedupeIds(args.requiredSpellIds ?? [])
  const contributions: StartingChoiceContribution[] = []

  if (weapons.length > 0) {
    contributions.push({
      id: 'constraint:requiredWeaponIds',
      category: 'weapon',
      mechanic: 'explicit-constraint',
      constraint: 'requiredWeaponIds',
      owner: {},
      selectedIds: weapons,
    })
  }

  if (spells.length > 0) {
    contributions.push({
      id: 'constraint:requiredSpellIds',
      category: 'spell',
      mechanic: 'explicit-constraint',
      constraint: 'requiredSpellIds',
      owner: {},
      selectedIds: spells,
    })
  }

  return contributions
}

function orderContributions(
  contributions: readonly StartingChoiceContribution[],
): StartingChoiceContribution[] {
  const mechanicOrder = { 'fixed-grant': 0, 'choice-allowance': 1, 'explicit-constraint': 2 }
  return [...contributions].sort((left, right) => {
    const categoryDelta =
      CATEGORY_ORDER.indexOf(left.category) - CATEGORY_ORDER.indexOf(right.category)
    if (categoryDelta !== 0) return categoryDelta
    return mechanicOrder[left.mechanic] - mechanicOrder[right.mechanic]
  })
}

export function resolveNpcStartingChoices(args: {
  context: CharacterBuildContext
  seed: {
    speciesId: string
    classId?: string
    level: CharacterBuilderDraft['class']['level']
    npcTemplateId?: CharacterBuilderDraft['npcTemplateId']
  }
  /**
   * Selected heritage option. Dependent allowances appear only after heritage
   * is on the draft. Quick NPC does not choose heritage, so this stays unset
   * there and matches the automatic build.
   */
  heritageOptionId?: string
  startingChoiceOverrides?: Record<string, readonly string[]>
  requiredWeaponIds?: readonly string[]
  requiredSpellIds?: readonly string[]
  preferences?: AutomaticNpcBuildPreferences
}): NpcStartingChoices {
  const baseDraft = withHeritageOption(
    seedAutomaticChoiceDraft(args.seed, args.context, args.preferences),
    args.seed.speciesId,
    args.heritageOptionId,
  )
  const graph = resolveAutomaticChoiceSelections({
    draft: baseDraft,
    context: args.context,
    preferences: args.preferences,
  })
  const graphSets = graph.ok ? graph.resolvedChoiceSets : []
  const allowanceSets = graphSets.filter(isStartingChoiceAllowance)
  const allowanceSetIds = new Set(allowanceSets.map((choiceSet) => choiceSet.id))
  const { pruned, removedOverrideIds } = pruneOverrides({
    overrides: args.startingChoiceOverrides,
    allowanceSets,
  })
  const { pinned: pinnedNonAllowance, pinnedChoiceSetIds: pinnedNonAllowanceIds } =
    pinNonAllowanceChoiceSetOverrides({
      overrides: args.startingChoiceOverrides,
      choiceSets: graphSets,
      allowanceSetIds,
    })
  const mergedPinnedSelections = { ...pruned, ...pinnedNonAllowance }
  const seededDraft = {
    ...baseDraft,
    choiceSelections: {
      ...baseDraft.choiceSelections,
      ...Object.fromEntries(
        Object.entries(mergedPinnedSelections).map(([choiceSetId, selectedIds]) => [
          choiceSetId,
          [...selectedIds],
        ]),
      ),
    },
  }
  const current = resolveAutomaticChoiceSelections({
    draft: seededDraft,
    context: args.context,
    preferences: args.preferences,
    pinnedChoiceSetIds: new Set([...Object.keys(pruned), ...pinnedNonAllowanceIds]),
  })
  const draft = current.ok ? current.draft : seededDraft
  const resolvedChoiceSets = current.ok ? current.resolvedChoiceSets : graphSets
  const suggestedBy = current.ok ? current.suggestedBy : {}

  const contributions = orderContributions([
    ...fixedContributions({ draft, context: args.context, choiceSets: resolvedChoiceSets }),
    ...allowanceContributions({
      choiceSets: resolvedChoiceSets,
      draft,
      suggestedBy,
      overriddenIds: new Set(Object.keys(pruned)),
    }),
    ...constraintContributions({
      requiredWeaponIds: args.requiredWeaponIds,
      requiredSpellIds: args.requiredSpellIds,
      draft,
      context: args.context,
    }),
  ])

  return { contributions, removedOverrideIds, draft, resolvedChoiceSets }
}

/** Complete allowance fills to seed before automatic top-up. Short overrides are omitted. */
export function npcStartingChoiceAllowanceSelections(
  choices: NpcStartingChoices,
): Record<string, string[]> {
  const selections: Record<string, string[]> = {}
  for (const contribution of choices.contributions) {
    if (contribution.mechanic !== 'choice-allowance') continue
    if (contribution.selectedIds.length < contribution.allowance.min) continue
    selections[contribution.choiceSetId] = [...contribution.selectedIds]
  }
  for (const choiceSet of choices.resolvedChoiceSets) {
    if (choiceSet.choiceType !== 'equipment') continue
    const selectedIds = choices.draft.choiceSelections[choiceSet.id] ?? []
    if (selectedIds.length < choiceSet.min) continue
    selections[choiceSet.id] = [...selectedIds]
  }
  return selections
}

export function npcStartingChoiceManualConstraints(
  choices: NpcStartingChoices,
): AutomaticNpcBuildConstraints | undefined {
  const weapons = choices.contributions.find(
    (contribution) =>
      contribution.mechanic === 'explicit-constraint' &&
      contribution.constraint === 'requiredWeaponIds',
  )
  const spells = choices.contributions.find(
    (contribution) =>
      contribution.mechanic === 'explicit-constraint' &&
      contribution.constraint === 'requiredSpellIds',
  )
  return normalizeAutomaticNpcBuildConstraints({
    requiredWeaponIds: weapons ? [...weapons.selectedIds] : [],
    requiredSpellIds: spells ? [...spells.selectedIds] : [],
  })
}

export function npcStartingChoiceIncompleteOverride(
  choices: NpcStartingChoices,
): StartingChoiceContribution | undefined {
  return choices.contributions.find(
    (contribution) =>
      contribution.mechanic === 'choice-allowance' &&
      contribution.overridden &&
      contribution.selectedIds.length < contribution.allowance.min,
  )
}
