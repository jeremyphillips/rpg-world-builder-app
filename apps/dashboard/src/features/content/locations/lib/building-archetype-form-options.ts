import {
  BUILDING_ARCHETYPE_ENTRIES,
  BUILDING_ARCHETYPE_IDS,
  BUILDING_FUNCTION_FAMILY_ENTRIES,
  BUILDING_FUNCTION_FAMILY_IDS,
  formatBuildingFunctionFamilyLabels,
  getBuildingArchetypeFunctions,
  getBuildingArchetypeLabel,
  getBuildingArchetypeSearchTerms,
  type BuildingArchetype,
  type BuildingFunctionFamily,
} from '@rpg/contracts'
import { optionMatchesQuery, rankOptionsByQuery } from '@rpg/ui'
import { toOptions, type FieldOption } from '@rpg/ui/form'

const BUILDING_FUNCTION_OVERRIDE_GUIDANCE =
  'Only change this when this particular building serves a substantially different function than its archetype normally does.'

/**
 * Combobox search ranking for building archetype options follows `@rpg/search` field
 * roles assembled in `assembleComboboxOptionSearchDocument`: label exact/prefix first,
 * then label substring, then composed keyword search terms (registry aliases, function
 * labels, manifestation parent label).
 */
function normalizeArchetypeSearchTerm(text: string): string {
  return text.trim().toLowerCase()
}

/** Composes additional searchable strings for one registry archetype. */
export function buildBuildingArchetypeSearchTerms(archetype: BuildingArchetype): readonly string[] {
  const entry = BUILDING_ARCHETYPE_ENTRIES[archetype]
  const terms = new Set<string>()

  for (const term of getBuildingArchetypeSearchTerms(archetype)) {
    terms.add(term)
  }

  for (const fn of getBuildingArchetypeFunctions(archetype)) {
    terms.add(normalizeArchetypeSearchTerm(BUILDING_FUNCTION_FAMILY_ENTRIES[fn].label))
  }

  if ('manifestationOf' in entry && entry.manifestationOf) {
    terms.add(normalizeArchetypeSearchTerm(getBuildingArchetypeLabel(entry.manifestationOf)))
  }

  return [...terms]
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

/** Ranks matching archetype combobox options by label-first `@rpg/search` scoring. */
export function rankBuildingArchetypeFieldOptions(query: string): FieldOption[] {
  return rankOptionsByQuery(buildBuildingArchetypeFieldOptions(), query)
}

export function buildBuildingFunctionOverrideFieldOptions(): FieldOption[] {
  return toOptions(
    BUILDING_FUNCTION_FAMILY_IDS,
    Object.fromEntries(
      BUILDING_FUNCTION_FAMILY_IDS.map((id) => [id, BUILDING_FUNCTION_FAMILY_ENTRIES[id].label]),
    ) as Record<BuildingFunctionFamily, string>,
  )
}

/** Read-only typical-uses hint shown after an archetype is selected. */
export function formatBuildingArchetypeTypicalUsesHint(
  values: Record<string, unknown>,
): string | undefined {
  const archetype = readSelectedArchetype(values)
  if (!archetype) return undefined

  return `Typical uses: ${formatBuildingFunctionFamilyLabels(getBuildingArchetypeFunctions(archetype))}`
}

/** Guidance and default-function context for the function override control. */
export function formatBuildingFunctionOverrideHint(
  values: Record<string, unknown>,
): string | undefined {
  const archetype = readSelectedArchetype(values)
  if (!archetype) return BUILDING_FUNCTION_OVERRIDE_GUIDANCE

  const defaults = formatBuildingFunctionFamilyLabels(getBuildingArchetypeFunctions(archetype))
  return `Default functions: ${defaults}. ${BUILDING_FUNCTION_OVERRIDE_GUIDANCE}`
}
