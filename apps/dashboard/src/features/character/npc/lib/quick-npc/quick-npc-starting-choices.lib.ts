import {
  assembleCharacterProficiencies,
  buildSelectionSourceLabelCatalogIndex,
  formatGrantCardProficiencySourceLabel,
  formatStandardSelectionSourceLabel,
  getNpcTemplateEntry,
  indexCharacterBuildCatalog,
  optionIdentitiesOverlap,
  resolveNpcStartingChoices,
  resolveProficiencyChoiceSetPresentation,
  resolveProficiencyPickerItems,
  type CharacterBuildContext,
  type ChoiceSet,
  type NpcRecommendationSource,
  type NpcStartingChoices,
  type ProficiencyChoiceSetPresentation,
  type StartingChoiceCategory,
  type StartingChoiceContribution,
} from '@rpg/contracts'

import type { QuickNpcCreateContext } from './quick-npc-create-context'
import {
  isQuickNpcOrganizationMemberSetup,
  type QuickNpcSetupValues,
} from './quick-npc-form-fields'
import {
  buildQuickNpcAutomaticPreferences,
  resolveQuickNpcTemplateRecommendations,
} from './quick-npc-template-recommendations.lib'

const STARTING_CHOICE_PRESENTATION: Record<StartingChoiceCategory, { label: string }> = {
  skill: { label: 'Skills' },
  tool: { label: 'Tools' },
  language: { label: 'Languages' },
  equipment: { label: 'Equipment' },
  weapon: { label: 'Weapons' },
  spell: { label: 'Spells' },
}

const MECHANIC_ORDER: Record<StartingChoiceContribution['mechanic'], number> = {
  'fixed-grant': 0,
  'choice-allowance': 1,
  'explicit-constraint': 2,
}

export function startingChoiceKindLabel(kind: StartingChoiceCategory): string {
  return STARTING_CHOICE_PRESENTATION[kind].label
}

export type StartingChoiceSuggestionLabels = {
  template?: string
  title?: string
  species?: string
}

function suggestionSourceLabel(
  source: NpcRecommendationSource,
  labels: StartingChoiceSuggestionLabels,
): string | undefined {
  if (source === 'template') return labels.template ? `${labels.template} role` : undefined
  if (source === 'title') return labels.title
  if (source === 'species') return labels.species ? `${labels.species} species` : undefined
  return undefined
}

/**
 * Explanatory copy only. Names a source when that one source traced every selected value.
 * An empty source list is canonical order and is never called a suggestion.
 */
export function startingChoiceSuggestionHint(args: {
  selectedIds: readonly string[]
  suggestedBy?: Readonly<Record<string, readonly NpcRecommendationSource[]>>
  labels?: StartingChoiceSuggestionLabels
}): string | undefined {
  if (!args.suggestedBy || args.selectedIds.length === 0) return undefined
  const traced = args.selectedIds.map((id) => args.suggestedBy?.[id] ?? [])
  const first = traced[0]
  if (!first || first.length !== 1) return undefined
  const source = first[0]
  if (!source || !traced.every((sources) => sources.length === 1 && sources[0] === source)) {
    return undefined
  }
  const label = suggestionSourceLabel(source, args.labels ?? {})
  return label ? `Suggested by ${label}` : undefined
}

export function startingChoiceHasNamedAttribution(args: {
  selectedIds: readonly string[]
  suggestedBy?: Readonly<Record<string, readonly NpcRecommendationSource[]>>
  labels?: StartingChoiceSuggestionLabels
}): boolean {
  const labels = args.labels ?? {}
  return args.selectedIds.some((id) =>
    (args.suggestedBy?.[id] ?? []).some((source) => suggestionSourceLabel(source, labels)),
  )
}

export function startingChoiceResetLabel(args: {
  count: number
  namedAttribution: boolean
}): string {
  if (args.namedAttribution) {
    return args.count === 1 ? 'Use suggested choice' : 'Use suggested choices'
  }
  return args.count === 1 ? 'Reset to default choice' : 'Reset to default choices'
}

export function startingChoiceFillsMatch(
  current: readonly string[],
  canonical: readonly string[],
): boolean {
  if (current.length !== canonical.length) return false
  return current.every((id, index) => id === canonical[index])
}

export type CanonicalStartingChoiceAllowance = {
  selectedIds: readonly string[]
  suggestedBy?: Readonly<Record<string, readonly NpcRecommendationSource[]>>
}

function preferenceArgs(args: {
  setup: QuickNpcSetupValues
  context: CharacterBuildContext
  createContext: QuickNpcCreateContext
}) {
  const organization =
    args.createContext.kind === 'organization-member' ? args.createContext.organization : undefined
  return {
    values: args.setup,
    context: args.context,
    titles: organization?.members?.titles ?? [],
    organizationClassAffinityIds: organization?.members?.classAffinityIds,
    organizationTemplateId: organization?.members?.npcTemplateId,
  }
}

export function resolveQuickNpcStartingChoices(args: {
  setup: QuickNpcSetupValues
  context: CharacterBuildContext
  createContext: QuickNpcCreateContext
  startingChoiceOverrides?: Record<string, readonly string[]>
  requiredWeaponIds?: readonly string[]
  requiredSpellIds?: readonly string[]
}): NpcStartingChoices {
  const preferences = buildQuickNpcAutomaticPreferences(preferenceArgs(args))

  return resolveNpcStartingChoices({
    context: args.context,
    seed: {
      speciesId: args.setup.speciesId,
      ...(args.setup.classId ? { classId: args.setup.classId } : {}),
      level: args.setup.level,
      ...(args.setup.npcTemplateId ? { npcTemplateId: args.setup.npcTemplateId } : {}),
    },
    startingChoiceOverrides: args.startingChoiceOverrides,
    requiredWeaponIds: args.requiredWeaponIds,
    requiredSpellIds: args.requiredSpellIds,
    preferences,
  })
}

/** Fill when this allowance has no user override key. */
export function resolveCanonicalStartingChoiceAllowance(args: {
  setup: QuickNpcSetupValues
  context: CharacterBuildContext
  createContext: QuickNpcCreateContext
  choiceSetId: string
  startingChoiceOverrides?: Record<string, readonly string[]>
  requiredWeaponIds?: readonly string[]
  requiredSpellIds?: readonly string[]
}): CanonicalStartingChoiceAllowance {
  const overrides = { ...(args.startingChoiceOverrides ?? {}) }
  delete overrides[args.choiceSetId]
  const choices = resolveQuickNpcStartingChoices({
    setup: args.setup,
    context: args.context,
    createContext: args.createContext,
    startingChoiceOverrides: overrides,
    requiredWeaponIds: args.requiredWeaponIds,
    requiredSpellIds: args.requiredSpellIds,
  })
  const entry = choices.contributions.find(
    (candidate) =>
      candidate.mechanic === 'choice-allowance' && candidate.choiceSetId === args.choiceSetId,
  )
  return {
    selectedIds: entry?.selectedIds ?? [],
    suggestedBy: entry?.mechanic === 'choice-allowance' ? entry.suggestedBy : undefined,
  }
}

export function startingChoiceShowSuggestedReset(args: {
  currentIds: readonly string[]
  canonical: CanonicalStartingChoiceAllowance
  overridden: boolean
}): boolean {
  return args.overridden && !startingChoiceFillsMatch(args.currentIds, args.canonical.selectedIds)
}

export function startingChoiceAllowanceChoiceSet(
  choices: NpcStartingChoices,
  contribution: StartingChoiceContribution,
): ChoiceSet | undefined {
  if (contribution.mechanic !== 'choice-allowance') return undefined
  return choices.resolvedChoiceSets.find((choiceSet) => choiceSet.id === contribution.choiceSetId)
}

export function startingChoiceAllowancePresentation(
  choices: NpcStartingChoices,
  contribution: StartingChoiceContribution,
): ProficiencyChoiceSetPresentation | undefined {
  const choiceSet = startingChoiceAllowanceChoiceSet(choices, contribution)
  return choiceSet ? resolveProficiencyChoiceSetPresentation(choiceSet) : undefined
}

function selectionSourceLabelCatalog(context: CharacterBuildContext) {
  return buildSelectionSourceLabelCatalogIndex({
    catalogIndex: indexCharacterBuildCatalog(context.catalog),
    characterCreationRules: context.characterCreationRules,
  })
}

export function formatFixedGrantProvenance(
  contribution: StartingChoiceContribution,
  context: CharacterBuildContext,
): string {
  if (contribution.mechanic !== 'fixed-grant') return 'Granted'
  return formatGrantCardProficiencySourceLabel(
    [contribution.source],
    selectionSourceLabelCatalog(context),
  )
}

export function formatStartingChoiceProvenance(
  contribution: StartingChoiceContribution,
  context: CharacterBuildContext,
): string {
  if (contribution.mechanic === 'explicit-constraint') return 'Added manually'
  if (contribution.mechanic === 'fixed-grant')
    return formatFixedGrantProvenance(contribution, context)
  return ''
}

export function startingChoiceAlsoGrantedHint(
  contribution: StartingChoiceContribution,
  contributions: readonly StartingChoiceContribution[],
  selectedId: string,
  context: CharacterBuildContext,
): string | undefined {
  if (contribution.mechanic !== 'choice-allowance') return undefined
  const grant = contributions.find(
    (entry) =>
      entry.mechanic === 'fixed-grant' &&
      entry.category === contribution.category &&
      entry.selectedIds.some((grantedId) => optionIdentitiesOverlap(grantedId, selectedId)),
  )
  if (!grant || grant.mechanic !== 'fixed-grant') return undefined
  const label = formatStandardSelectionSourceLabel(
    [grant.source],
    selectionSourceLabelCatalog(context),
  )
  return label ? `Also granted by ${label}` : 'Also granted'
}

export type StartingChoiceCategoryGroup = {
  kind: StartingChoiceCategory
  label: string
  entries: readonly StartingChoiceContribution[]
  canChange: boolean
}

export function groupStartingChoicesByKind(
  choices: NpcStartingChoices,
): StartingChoiceCategoryGroup[] {
  const order: StartingChoiceCategory[] = [
    'skill',
    'tool',
    'language',
    'equipment',
    'weapon',
    'spell',
  ]
  return order.flatMap((kind) => {
    const entries = choices.contributions
      .filter((entry) => entry.category === kind)
      .slice()
      .sort((left, right) => MECHANIC_ORDER[left.mechanic] - MECHANIC_ORDER[right.mechanic])
    if (entries.length === 0) return []
    return [
      {
        kind,
        label: STARTING_CHOICE_PRESENTATION[kind].label,
        entries,
        canChange: entries.some(
          (entry) =>
            entry.mechanic === 'choice-allowance' || entry.mechanic === 'explicit-constraint',
        ),
      },
    ]
  })
}

export function resolveStartingChoiceSuggestionLabels(args: {
  setup: QuickNpcSetupValues
  context: CharacterBuildContext
  createContext: QuickNpcCreateContext
}): StartingChoiceSuggestionLabels {
  const shared = preferenceArgs(args)
  const recommendations = resolveQuickNpcTemplateRecommendations({
    ...shared,
    lockInUserClass: true,
  })
  const catalog = indexCharacterBuildCatalog(args.context.catalog)
  const species = catalog.species.get(args.setup.speciesId)
  const memberSetup = isQuickNpcOrganizationMemberSetup(args.setup) ? args.setup : undefined
  const titles =
    args.createContext.kind === 'organization-member'
      ? args.createContext.organization.members?.titles
      : undefined
  const title = titles?.find((entry) => entry.id === memberSetup?.membershipTitle)

  return {
    template: recommendations.npcTemplateId
      ? getNpcTemplateEntry(recommendations.npcTemplateId)?.label
      : undefined,
    title: title?.label,
    species: species?.name,
  }
}

export function pruneQuickNpcStartingChoiceOverrides(args: {
  setup: QuickNpcSetupValues
  context: CharacterBuildContext
  createContext: QuickNpcCreateContext
  overrides: Record<string, readonly string[]>
}): Record<string, string[]> {
  const choices = resolveQuickNpcStartingChoices({
    setup: args.setup,
    context: args.context,
    createContext: args.createContext,
    startingChoiceOverrides: args.overrides,
  })
  const kept = new Map(
    choices.contributions.flatMap((contribution) =>
      contribution.mechanic === 'choice-allowance' && contribution.overridden
        ? [[contribution.choiceSetId, [...contribution.selectedIds] as string[]] as const]
        : [],
    ),
  )
  const next: Record<string, string[]> = {}
  for (const choiceSetId of Object.keys(args.overrides)) {
    const selectedIds = kept.get(choiceSetId)
    if (!selectedIds) continue
    next[choiceSetId] = selectedIds
  }
  return next
}

function resolveStartingChoiceSelectedIdLabel(
  id: string,
  optionLabels: ReadonlyMap<string, string>,
  catalog: ReturnType<typeof indexCharacterBuildCatalog>,
  languages: CharacterBuildContext['catalog']['languages'],
): string {
  const skill = [...catalog.skillProficiencies.values()].find(
    (row) => row.id === id || row.slug === id,
  )
  const equipment = catalog.equipment.get(id)
  return (
    optionLabels.get(id) ??
    equipment?.name ??
    skill?.name ??
    languages.find((language) => language.id === id)?.label ??
    id
  )
}

function formatStartingChoiceDisplayLabel(
  label: string,
  contribution: StartingChoiceContribution,
  id: string,
): string {
  const quantity =
    contribution.mechanic === 'fixed-grant' ? contribution.quantities?.[id] : undefined
  return quantity && quantity > 1 ? `${label} ×${quantity}` : label
}

export function startingChoiceDisplayLabels(args: {
  context: CharacterBuildContext
  choices: NpcStartingChoices
  contribution: StartingChoiceContribution
}): string[] {
  const optionLabels = new Map<string, string>()
  for (const choiceSet of args.choices.resolvedChoiceSets) {
    for (const option of choiceSet.options) optionLabels.set(option.id, option.label)
  }
  const catalog = indexCharacterBuildCatalog(args.context.catalog)

  return args.contribution.selectedIds.map((id) =>
    formatStartingChoiceDisplayLabel(
      resolveStartingChoiceSelectedIdLabel(
        id,
        optionLabels,
        catalog,
        args.context.catalog.languages,
      ),
      args.contribution,
      id,
    ),
  )
}

export function startingChoicePickerOptions(args: {
  context: CharacterBuildContext
  choices: NpcStartingChoices
  choiceSetId: string
  selectedIds: readonly string[]
}): { value: string; label: string; disabled?: boolean; metadata?: string }[] {
  const draft = {
    ...args.choices.draft,
    choiceSelections: {
      ...args.choices.draft.choiceSelections,
      [args.choiceSetId]: [...args.selectedIds],
    },
  }
  const heldDraft = {
    ...draft,
    choiceSelections: {
      ...draft.choiceSelections,
      [args.choiceSetId]: [],
    },
  }
  const catalogIndex = indexCharacterBuildCatalog(args.context.catalog)
  const characterClass = heldDraft.class.classId
    ? catalogIndex.classes.get(heldDraft.class.classId)
    : undefined
  const proficiencies = assembleCharacterProficiencies(
    heldDraft,
    catalogIndex,
    args.choices.resolvedChoiceSets,
    characterClass,
    args.context,
  )
  return resolveProficiencyPickerItems({
    draft,
    context: args.context,
    choiceSetId: args.choiceSetId,
    proficiencies,
  })
    .filter((item) => !item.state.isAlreadySelected)
    .map((item) => ({
      value: item.optionId,
      label: item.label,
      ...(item.state.isAlreadyGranted ? { disabled: true } : {}),
      ...(item.state.disabledReasons[0] ? { metadata: item.state.disabledReasons[0] } : {}),
    }))
}

/** A fill equal to canonical deletes the override key. */
export function normalizeStartingChoiceOverride(args: {
  currentIds: readonly string[]
  canonicalIds: readonly string[]
}): string[] | undefined {
  if (startingChoiceFillsMatch(args.currentIds, args.canonicalIds)) return undefined
  return [...args.currentIds]
}
