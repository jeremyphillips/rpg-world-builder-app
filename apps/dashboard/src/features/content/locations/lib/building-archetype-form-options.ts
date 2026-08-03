import {
  BUILDING_ARCHETYPE_ENTRIES,
  BUILDING_ARCHETYPE_IDS,
  BUILDING_FUNCTION_FAMILY_ENTRIES,
  BUILDING_FUNCTION_FAMILY_IDS,
  formatBuildingFunctionFamilyLabels,
  getBuildingArchetypeAliases,
  getBuildingArchetypeDiscoveryTerms,
  getBuildingArchetypeFunctions,
  getBuildingArchetypeLabel,
  type BuildingArchetype,
  type BuildingFunctionFamily,
} from '@rpg/contracts'
import { optionMatchesQuery } from '@rpg/ui'
import { toOptions, type FieldDerivedMeta, type FieldOption } from '@rpg/ui/form'

export const BUILDING_FUNCTION_OVERRIDE_HINT =
  "Replaces the archetype's typical uses for this building."

/** Precedence tiers for archetype combobox ranking (higher = better match). */
const RANK_TIER = {
  LABEL_EXACT: 1_000_000,
  LABEL_PREFIX: 900_000,
  ALIAS: 800_000,
  MANIFESTATION_PARENT: 700_000,
  FUNCTION_LABEL: 600_000,
  SEARCH_TERM: 500_000,
} as const

function normalizeArchetypeSearchTerm(text: string): string {
  return text.trim().toLowerCase()
}

function classifyMatchTier(text: string, query: string): 'exact' | 'prefix' | 'substring' | 'none' {
  const normalizedText = text.trim().toLowerCase()
  if (!normalizedText || !query) return 'none'
  if (normalizedText === query) return 'exact'
  if (normalizedText.startsWith(query)) return 'prefix'
  if (normalizedText.includes(query)) return 'substring'
  return 'none'
}

function tierScore(base: number, tier: 'exact' | 'prefix' | 'substring'): number {
  if (tier === 'exact') return base
  if (tier === 'prefix') return base - 50_000
  return base - 100_000
}

function bestTierScore(terms: readonly string[], query: string, base: number): number {
  let best = 0
  for (const term of terms) {
    const tier = classifyMatchTier(term, query)
    if (tier === 'none') continue
    best = Math.max(best, tierScore(base, tier))
  }
  return best
}

/** Composes additional searchable strings for one registry archetype. */
export function buildBuildingArchetypeSearchTerms(archetype: BuildingArchetype): readonly string[] {
  const entry = BUILDING_ARCHETYPE_ENTRIES[archetype]
  const terms = new Set<string>()

  for (const term of getBuildingArchetypeDiscoveryTerms(archetype)) {
    terms.add(term)
  }

  for (const alias of getBuildingArchetypeAliases(archetype)) {
    terms.add(alias)
  }

  for (const fn of getBuildingArchetypeFunctions(archetype)) {
    terms.add(normalizeArchetypeSearchTerm(BUILDING_FUNCTION_FAMILY_ENTRIES[fn].label))
  }

  if ('manifestationOf' in entry && entry.manifestationOf) {
    terms.add(normalizeArchetypeSearchTerm(getBuildingArchetypeLabel(entry.manifestationOf)))
  }

  return [...terms]
}

function scoreBuildingArchetypeOption(archetype: BuildingArchetype, query: string): number {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return 0

  const entry = BUILDING_ARCHETYPE_ENTRIES[archetype]
  const labelTier = classifyMatchTier(entry.label, normalized)
  if (labelTier === 'exact') return RANK_TIER.LABEL_EXACT
  if (labelTier === 'prefix') return RANK_TIER.LABEL_PREFIX
  if (labelTier === 'substring') return RANK_TIER.LABEL_PREFIX - 10_000

  const aliasScore = bestTierScore(
    getBuildingArchetypeAliases(archetype),
    normalized,
    RANK_TIER.ALIAS,
  )
  if (aliasScore > 0) return aliasScore

  if ('manifestationOf' in entry && entry.manifestationOf) {
    const parentLabel = getBuildingArchetypeLabel(entry.manifestationOf)
    const parentScore = bestTierScore([parentLabel], normalized, RANK_TIER.MANIFESTATION_PARENT)
    if (parentScore > 0) return parentScore
  }

  const functionLabels = getBuildingArchetypeFunctions(archetype).map(
    (fn: BuildingFunctionFamily) => BUILDING_FUNCTION_FAMILY_ENTRIES[fn].label,
  )
  const functionScore = bestTierScore(functionLabels, normalized, RANK_TIER.FUNCTION_LABEL)
  if (functionScore > 0) return functionScore

  return bestTierScore(
    getBuildingArchetypeDiscoveryTerms(archetype),
    normalized,
    RANK_TIER.SEARCH_TERM,
  )
}

function readSelectedArchetype(values: Record<string, unknown>): BuildingArchetype | undefined {
  const archetype = values['classification.archetype']
  if (typeof archetype !== 'string') return undefined
  return BUILDING_ARCHETYPE_IDS.includes(archetype as BuildingArchetype)
    ? (archetype as BuildingArchetype)
    : undefined
}

/** Composes combobox row description: optional manifestation prefix + function labels. */
export function formatBuildingArchetypeOptionDescription(archetype: BuildingArchetype): string {
  const entry = BUILDING_ARCHETYPE_ENTRIES[archetype]
  const functionLabels = formatBuildingFunctionFamilyLabels(
    getBuildingArchetypeFunctions(archetype),
  )
  const manifestation =
    'manifestationOf' in entry && entry.manifestationOf
      ? `${getBuildingArchetypeLabel(entry.manifestationOf)} manifestation`
      : undefined

  return manifestation ? `${manifestation} · ${functionLabels}` : functionLabels
}

/** Maps registry entries to combobox options for building archetype selection. */
export function buildBuildingArchetypeFieldOptions(): FieldOption[] {
  return BUILDING_ARCHETYPE_IDS.map((id) => ({
    value: id,
    label: BUILDING_ARCHETYPE_ENTRIES[id].label,
    description: formatBuildingArchetypeOptionDescription(id),
    searchTerms: buildBuildingArchetypeSearchTerms(id),
  }))
}

/** Filters archetype combobox options by the shared forgiving combobox query matcher. */
export function filterBuildingArchetypeFieldOptions(query: string): FieldOption[] {
  const options = buildBuildingArchetypeFieldOptions()
  const normalized = query.trim()
  if (!normalized) return options
  return options.filter((option) => optionMatchesQuery(option, query))
}

/**
 * Ranks matching archetype combobox options by Model E precedence:
 * label exact → label prefix → alias → manifestation parent label → function label → search term.
 */
export function rankBuildingArchetypeFieldOptions(query: string): FieldOption[] {
  const normalized = query.trim()
  if (!normalized) return buildBuildingArchetypeFieldOptions()

  return buildBuildingArchetypeFieldOptions()
    .map((option, index) => ({
      option,
      index,
      score: scoreBuildingArchetypeOption(option.value as BuildingArchetype, normalized),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map((entry) => entry.option)
}

/** Combobox resolver: Model E rank plus selected-value visibility (matches filterOptions contract). */
export function resolveBuildingArchetypeFilteredOptions(
  options: FieldOption[],
  query: string,
  selected: string[] = [],
): FieldOption[] {
  const normalized = query.trim()
  const filtered = normalized ? rankBuildingArchetypeFieldOptions(normalized) : options

  const visibleValues = new Set(filtered.map((option) => option.value))
  const result = [...filtered]
  for (const value of selected) {
    if (!visibleValues.has(value)) {
      result.push(options.find((option) => option.value === value) ?? { value, label: value })
      visibleValues.add(value)
    }
  }
  return result
}

export function buildBuildingFunctionOverrideFieldOptions(): FieldOption[] {
  return toOptions(
    BUILDING_FUNCTION_FAMILY_IDS,
    Object.fromEntries(
      BUILDING_FUNCTION_FAMILY_IDS.map((id) => [id, BUILDING_FUNCTION_FAMILY_ENTRIES[id].label]),
    ) as Record<BuildingFunctionFamily, string>,
  )
}

/** Override choices excluding the selected archetype's default function families. */
export function resolveBuildingFunctionOverrideFieldOptions(
  values: Record<string, unknown>,
): FieldOption[] {
  const archetype = readSelectedArchetype(values)
  const defaultFunctions = archetype ? getBuildingArchetypeFunctions(archetype) : []
  const defaultFunctionIds = new Set(defaultFunctions)

  return BUILDING_FUNCTION_FAMILY_IDS.filter((id) => !defaultFunctionIds.has(id)).map((id) => ({
    value: id,
    label: BUILDING_FUNCTION_FAMILY_ENTRIES[id].label,
  }))
}

export function hasBuildingFunctionOverrideChoices(values: Record<string, unknown>): boolean {
  if (!readSelectedArchetype(values)) return false
  return resolveBuildingFunctionOverrideFieldOptions(values).length > 0
}

/** True when the override repeats an archetype default (semantic no-op). */
export function isRedundantBuildingFunctionOverride(values: Record<string, unknown>): boolean {
  const archetype = readSelectedArchetype(values)
  const override = values['classification.functionOverride']
  if (!archetype || typeof override !== 'string') return false

  return getBuildingArchetypeFunctions(archetype).includes(override as BuildingFunctionFamily)
}

/** Derived metadata for the selected building archetype (typical function uses). */
export function resolveBuildingArchetypeDerivedMeta(
  values: Record<string, unknown>,
): FieldDerivedMeta | undefined {
  const archetype = readSelectedArchetype(values)
  if (!archetype) return undefined

  return {
    rows: [
      {
        label: 'Typical uses',
        value: formatBuildingFunctionFamilyLabels(getBuildingArchetypeFunctions(archetype)),
      },
    ],
  }
}
