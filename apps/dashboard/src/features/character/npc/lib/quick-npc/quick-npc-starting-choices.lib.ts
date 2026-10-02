import {
  assembleCharacterProficiencies,
  buildSelectionSourceLabelCatalogIndex,
  formatGrantCardProficiencySourceLabel,
  formatRecommendationSourceLabel,
  formatStandardSelectionSourceLabel,
  formatSuggestedBySentence,
  getNpcTemplateEntry,
  indexCharacterBuildCatalog,
  optionIdentitiesOverlap,
  resolveNpcStartingChoices,
  STARTING_CHOICE_CATEGORY_ORDER,
  startingChoiceCategoryLabel,
  startingChoiceMechanicSortIndex,
  resolveProficiencyChoiceSetPresentation,
  resolveProficiencyPickerItems,
  type CharacterBuildContext,
  type ClassPackageChoice,
  type ChoiceSet,
  type NpcStartingChoices,
  type RecommendationSourceRef,
  type ProficiencyChoiceSetPresentation,
  type StartingChoiceCategory,
  type StartingChoiceContribution,
} from '@rpg/contracts'

import { formatInlineRecommendationSources } from '@/features/character/lib/recommendation/format-inline-recommendation-sources'

import type { QuickNpcCreateContext } from './quick-npc-create-context'
import {
  isQuickNpcOrganizationMemberSetup,
  type QuickNpcSetupValues,
} from './quick-npc-form-fields'
import {
  buildQuickNpcAutomaticPreferences,
  resolveQuickNpcTemplateRecommendations,
} from './quick-npc-template-recommendations.lib'

export function startingChoiceKindLabel(kind: StartingChoiceCategory): string {
  return startingChoiceCategoryLabel(kind)
}

export type StartingChoiceSuggestionLabels = {
  template?: string
  title?: string
  species?: string
  class?: string
}

export type StartingChoiceSuggestionCopy = {
  hint: string
  /** Full source list when the hint truncates to +N. */
  title?: string
}

function suggestionSourceLabel(
  source: RecommendationSourceRef,
  labels: StartingChoiceSuggestionLabels,
): string | undefined {
  const name =
    source.kind === 'role'
      ? labels.template
      : source.kind === 'title'
        ? labels.title
        : source.kind === 'species'
          ? labels.species
          : source.kind === 'class'
            ? labels.class
            : undefined
  if (source.kind !== 'user' && !name) return undefined
  return formatRecommendationSourceLabel(source, { name })
}

function suggestionCopy(
  sources: readonly RecommendationSourceRef[],
  labels: StartingChoiceSuggestionLabels,
): StartingChoiceSuggestionCopy | undefined {
  const sourceLabels = sources.flatMap((source) => suggestionSourceLabel(source, labels) ?? [])
  if (sourceLabels.length === 0) return undefined
  const formatted = formatInlineRecommendationSources(sourceLabels)
  return {
    hint: formatSuggestedBySentence(formatted.inline),
    ...(formatted.title ? { title: formatSuggestedBySentence(formatted.title) } : {}),
  }
}

/** Suggestion copy for one selected item. Empty source lists are canonical order. */
export function startingChoiceItemSuggestionHint(args: {
  selectedId: string
  suggestedBy?: Readonly<Record<string, readonly RecommendationSourceRef[]>>
  labels?: StartingChoiceSuggestionLabels
}): string | undefined {
  return startingChoiceItemSuggestionCopy(args)?.hint
}

export function startingChoiceItemSuggestionCopy(args: {
  selectedId: string
  suggestedBy?: Readonly<Record<string, readonly RecommendationSourceRef[]>>
  labels?: StartingChoiceSuggestionLabels
}): StartingChoiceSuggestionCopy | undefined {
  const sources = args.suggestedBy?.[args.selectedId] ?? []
  if (sources.length === 0) return undefined
  return suggestionCopy(sources, args.labels ?? {})
}

export function startingChoiceHasNamedAttribution(args: {
  selectedIds: readonly string[]
  suggestedBy?: Readonly<Record<string, readonly RecommendationSourceRef[]>>
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
  suggestedBy?: Readonly<Record<string, readonly RecommendationSourceRef[]>>
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
  classPackage?: ClassPackageChoice
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
    ...(args.classPackage ? { classPackage: args.classPackage } : {}),
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
  requiredSpellIds?: readonly string[]
}): CanonicalStartingChoiceAllowance {
  const batch = resolveCanonicalStartingChoiceAllowances(args)
  return (
    batch.get(args.choiceSetId) ?? {
      selectedIds: [],
      suggestedBy: undefined,
    }
  )
}

/** Canonical fills for every choice allowance — memoize at the UI boundary. */
export function resolveCanonicalStartingChoiceAllowances(args: {
  setup: QuickNpcSetupValues
  context: CharacterBuildContext
  createContext: QuickNpcCreateContext
  startingChoiceOverrides?: Record<string, readonly string[]>
  requiredSpellIds?: readonly string[]
}): Map<string, CanonicalStartingChoiceAllowance> {
  const choices = resolveQuickNpcStartingChoices({
    setup: args.setup,
    context: args.context,
    createContext: args.createContext,
    startingChoiceOverrides: args.startingChoiceOverrides,
    requiredSpellIds: args.requiredSpellIds,
  })
  const allowanceIds = choices.contributions.flatMap((entry) =>
    entry.mechanic === 'choice-allowance' ? [entry.choiceSetId] : [],
  )
  const map = new Map<string, CanonicalStartingChoiceAllowance>()
  for (const choiceSetId of allowanceIds) {
    const overrides = { ...(args.startingChoiceOverrides ?? {}) }
    delete overrides[choiceSetId]
    const canonicalChoices = resolveQuickNpcStartingChoices({
      setup: args.setup,
      context: args.context,
      createContext: args.createContext,
      startingChoiceOverrides: overrides,
      requiredSpellIds: args.requiredSpellIds,
    })
    const entry = canonicalChoices.contributions.find(
      (candidate) =>
        candidate.mechanic === 'choice-allowance' && candidate.choiceSetId === choiceSetId,
    )
    map.set(choiceSetId, {
      selectedIds: entry?.selectedIds ?? [],
      suggestedBy: entry?.mechanic === 'choice-allowance' ? entry.suggestedBy : undefined,
    })
  }
  return map
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

export type StartingChoiceCategoryAllowanceStatus = 'none' | 'complete' | 'incomplete'

/** Row status for categories with choice allowances — fixed grants / manual-only → `none`. */
export function resolveStartingChoiceCategoryAllowanceStatus(args: {
  entries: readonly StartingChoiceContribution[]
  overrides: Record<string, readonly string[]>
}): StartingChoiceCategoryAllowanceStatus {
  const allowances = args.entries.filter((entry) => entry.mechanic === 'choice-allowance')
  if (allowances.length === 0) return 'none'

  for (const entry of allowances) {
    if (entry.mechanic !== 'choice-allowance') continue
    const selectedIds = args.overrides[entry.choiceSetId] ?? entry.selectedIds
    const { min, max } = entry.allowance
    if (selectedIds.length < min || selectedIds.length > max) return 'incomplete'
  }

  return 'complete'
}

export function startingChoiceAddPlaceholder(kind: StartingChoiceCategory): string {
  return `+ ${startingChoiceAddAccessibleName(kind)}`
}

export function startingChoiceAddAccessibleName(kind: StartingChoiceCategory): string {
  switch (kind) {
    case 'skill':
      return 'Add skill'
    case 'tool':
      return 'Add tool'
    case 'language':
      return 'Add language'
    case 'spell':
      return 'Add spell'
    default:
      return 'Add item'
  }
}

export function groupStartingChoicesByKind(
  choices: NpcStartingChoices,
): StartingChoiceCategoryGroup[] {
  return STARTING_CHOICE_CATEGORY_ORDER.flatMap((kind) => {
    if (kind === 'weapon') return []
    const entries = choices.contributions
      .filter((entry) => entry.category === kind)
      .slice()
      .sort(
        (left, right) =>
          startingChoiceMechanicSortIndex(left.mechanic) -
          startingChoiceMechanicSortIndex(right.mechanic),
      )
    if (entries.length === 0) return []
    return [
      {
        kind,
        label: startingChoiceCategoryLabel(kind),
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

export function normalizeQuickNpcStartingChoiceOverrides(args: {
  setup: QuickNpcSetupValues
  context: CharacterBuildContext
  createContext: QuickNpcCreateContext
  overrides: Record<string, readonly string[]>
  requiredSpellIds?: readonly string[]
}): Record<string, string[]> {
  const choices = resolveQuickNpcStartingChoices({
    setup: args.setup,
    context: args.context,
    createContext: args.createContext,
    startingChoiceOverrides: args.overrides,
    requiredSpellIds: args.requiredSpellIds ?? [],
  })
  const canonicalAllowances = resolveCanonicalStartingChoiceAllowances({
    setup: args.setup,
    context: args.context,
    createContext: args.createContext,
    startingChoiceOverrides: args.overrides,
    requiredSpellIds: args.requiredSpellIds ?? [],
  })
  const next: Record<string, string[]> = {}
  for (const entry of choices.contributions) {
    if (entry.mechanic !== 'choice-allowance') continue
    const current = args.overrides[entry.choiceSetId] ?? [...entry.selectedIds]
    const canonical = canonicalAllowances.get(entry.choiceSetId) ?? { selectedIds: [] }
    const normalized = normalizeStartingChoiceOverride({
      currentIds: current,
      canonicalIds: canonical.selectedIds,
      allowance: entry.allowance,
    })
    if (normalized) next[entry.choiceSetId] = normalized
  }
  for (const [choiceSetId, selectedIds] of Object.entries(args.overrides)) {
    if (next[choiceSetId] !== undefined) continue
    if (choices.pinnedChoiceSetIds.includes(choiceSetId)) {
      next[choiceSetId] = [...selectedIds]
    }
  }
  return next
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

const STARTING_CHOICE_CATEGORY_SUMMARY_MAX_VISIBLE = 3

/** Deduped category row summary — up to three labels, then "+ N". */
export function formatStartingChoiceCategorySummary(labels: readonly string[]): string {
  const unique: string[] = []
  const seen = new Set<string>()
  for (const label of labels) {
    if (seen.has(label)) continue
    seen.add(label)
    unique.push(label)
  }
  if (unique.length === 0) return ''
  if (unique.length <= STARTING_CHOICE_CATEGORY_SUMMARY_MAX_VISIBLE) {
    return unique.join(', ')
  }
  const visible = unique.slice(0, STARTING_CHOICE_CATEGORY_SUMMARY_MAX_VISIBLE)
  const remaining = unique.length - STARTING_CHOICE_CATEGORY_SUMMARY_MAX_VISIBLE
  return `${visible.join(', ')} + ${remaining}`
}

export function resolveStartingChoiceCategoryLabels(args: {
  context: CharacterBuildContext
  choices: NpcStartingChoices
  entries: readonly StartingChoiceContribution[]
}): string[] {
  return args.entries.flatMap((entry) =>
    startingChoiceDisplayLabels({
      context: args.context,
      choices: args.choices,
      contribution: entry,
    }),
  )
}

export function startingChoiceCategorySummary(args: {
  context: CharacterBuildContext
  choices: NpcStartingChoices
  entries: readonly StartingChoiceContribution[]
}): string {
  return formatStartingChoiceCategorySummary(resolveStartingChoiceCategoryLabels(args))
}

export function buildStartingChoiceOptionLabelIndex(
  choices: NpcStartingChoices,
): Map<string, string> {
  const optionLabels = new Map<string, string>()
  for (const choiceSet of choices.resolvedChoiceSets) {
    for (const option of choiceSet.options) optionLabels.set(option.id, option.label)
  }
  return optionLabels
}

export function startingChoiceDisplayLabels(args: {
  context: CharacterBuildContext
  choices: NpcStartingChoices
  contribution: StartingChoiceContribution
  catalogIndex?: ReturnType<typeof indexCharacterBuildCatalog>
  optionLabels?: Map<string, string>
}): string[] {
  const catalogIndex = args.catalogIndex ?? indexCharacterBuildCatalog(args.context.catalog)
  const optionLabels = args.optionLabels ?? buildStartingChoiceOptionLabelIndex(args.choices)

  return args.contribution.selectedIds.map((id) =>
    formatStartingChoiceDisplayLabel(
      resolveStartingChoiceSelectedIdLabel(
        id,
        optionLabels,
        catalogIndex,
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

/** Removes an override only when the selection is complete and matches the canonical fill. */
export function normalizeStartingChoiceOverride(args: {
  currentIds: readonly string[]
  canonicalIds: readonly string[]
  allowance?: { min: number; max: number }
}): string[] | undefined {
  const allowance = args.allowance ?? {
    min: args.canonicalIds.length,
    max: args.canonicalIds.length,
  }
  const isComplete =
    args.currentIds.length >= allowance.min && args.currentIds.length <= allowance.max
  if (isComplete && startingChoiceFillsMatch(args.currentIds, args.canonicalIds)) {
    return undefined
  }
  return [...args.currentIds]
}
