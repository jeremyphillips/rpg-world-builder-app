/**
 * Building archetype registry for Model E classification.
 *
 * Archetype ids are persisted vocabulary — established in Phase 6 curation
 * (2026-08-03). Future renames or removals require deliberate migration.
 *
 * ## Manifestation discovery inheritance (Phase 7)
 *
 * Manifestation entries do **not** store the root archetype's label, aliases, or
 * searchTerms in their own registry fields. At projection time,
 * `getBuildingArchetypeDiscoveryTerms()` composes the root's label, aliases, and
 * searchTerms with the manifestation's own searchTerms (deduplicated). Dashboard
 * search and ranking consume the composed terms — never manually repeat root
 * discovery vocabulary on manifestation rows.
 *
 * ## Specialization admission rules (Phase 8)
 *
 * `specializationTerms` are registry-owned optional refinements for free-text
 * `classification.specialization`. A suggestion must be an archetype-specific,
 * commonly useful instance refinement (roadside inn, summer palace, bonded
 * warehouse, sea temple). Suggestions must represent genuinely narrower variants,
 * not aliases, manifestations, search terms, or restatements of the archetype.
 * Rejected categories: conditions (ruined), affiliations
 * (royal — unless identity-bearing like summer palace), cultural manifestations
 * (use `manifestationOf` archetypes), and arbitrary adjectives (large, old).
 * Terms are lowercase, trimmed, and deduplicated; they must not duplicate the
 * entry label, aliases, or searchTerms.
 */
import { keysFromEntries, vocabEnumFromEntries } from '../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../types'

import { BUILDING_ARCHETYPE_SHARD_ENTRIES } from './building-archetypes'
import {
  BUILDING_FUNCTION_FAMILY_ENTRIES,
  type BuildingFunctionFamily,
} from './building-function-family'

export const BUILDING_ARCHETYPE_TERM = {
  label: 'Building Archetype',
  description: 'Canonical building identity — what the structure is.',
  sentence: {
    singular: 'building archetype',
    plural: 'building archetypes',
  },
} as const satisfies VocabularyTerm

type BuildingArchetypeEntry = GameTermEntry & {
  readonly functions: readonly [BuildingFunctionFamily, BuildingFunctionFamily?]
  readonly manifestationOf?: string
  readonly aliases?: readonly string[]
  readonly searchTerms?: readonly string[]
  readonly specializationTerms?: readonly string[]
}

export const BUILDING_ARCHETYPE_ENTRIES = {
  ...BUILDING_ARCHETYPE_SHARD_ENTRIES,
} as const satisfies Record<string, BuildingArchetypeEntry>

export type BuildingArchetype = keyof typeof BUILDING_ARCHETYPE_ENTRIES

export const BUILDING_ARCHETYPE_IDS = keysFromEntries(BUILDING_ARCHETYPE_ENTRIES)

export const buildingArchetypeSchema = vocabEnumFromEntries(BUILDING_ARCHETYPE_ENTRIES)

export type BuildingClassificationInput = {
  readonly archetype: BuildingArchetype
  readonly functionOverride?: BuildingFunctionFamily
}

function normalizeDiscoveryTerms(terms: readonly string[]): readonly string[] {
  const seen = new Set<string>()
  const normalized: string[] = []
  for (const term of terms) {
    const value = term.trim().toLowerCase()
    if (!value || seen.has(value)) continue
    seen.add(value)
    normalized.push(value)
  }
  return normalized
}

/** Returns the registry entry for an archetype id, if known. */
export function getBuildingArchetypeDefinition(
  archetype: string,
): BuildingArchetypeEntry | undefined {
  return BUILDING_ARCHETYPE_ENTRIES[archetype as BuildingArchetype]
}

/** Returns the display label for an archetype. Falls back to the raw id. */
export function getBuildingArchetypeLabel(archetype: string): string {
  return getBuildingArchetypeDefinition(archetype)?.label ?? archetype
}

/** Returns the default function families for an archetype. */
export function getBuildingArchetypeFunctions(
  archetype: BuildingArchetype,
): readonly BuildingFunctionFamily[] {
  return BUILDING_ARCHETYPE_ENTRIES[archetype].functions.filter(
    (fn: BuildingFunctionFamily | undefined): fn is BuildingFunctionFamily => fn !== undefined,
  )
}

/**
 * Effective semantic functions for a building classification.
 * Override replaces — never augments — the archetype default set.
 */
export function getEffectiveBuildingFunctions(
  classification: BuildingClassificationInput,
): readonly BuildingFunctionFamily[] {
  if (classification.functionOverride) {
    return [classification.functionOverride]
  }
  return getBuildingArchetypeFunctions(classification.archetype)
}

/** Returns stored aliases for an archetype (own registry field only). */
export function getBuildingArchetypeAliases(archetype: BuildingArchetype): readonly string[] {
  const entry = BUILDING_ARCHETYPE_ENTRIES[archetype]
  return 'aliases' in entry && entry.aliases ? entry.aliases : []
}

/** Returns stored search terms for an archetype (own registry field only). */
export function getBuildingArchetypeSearchTerms(archetype: BuildingArchetype): readonly string[] {
  const entry = BUILDING_ARCHETYPE_ENTRIES[archetype]
  return 'searchTerms' in entry && entry.searchTerms ? entry.searchTerms : []
}

/** Returns curated specialization suggestions for an archetype (registry-owned). */
export function getBuildingSpecializationTerms(archetype: BuildingArchetype): readonly string[] {
  const entry = BUILDING_ARCHETYPE_ENTRIES[archetype]
  return 'specializationTerms' in entry && entry.specializationTerms
    ? entry.specializationTerms
    : []
}

/**
 * Returns composed discovery terms for search.
 * Root archetypes: own searchTerms only.
 * Manifestations: own searchTerms plus inherited root label, aliases, and searchTerms
 * (deduplicated — inherited terms are not stored on the manifestation row).
 */
export function getBuildingArchetypeDiscoveryTerms(
  archetype: BuildingArchetype,
): readonly string[] {
  const entry = BUILDING_ARCHETYPE_ENTRIES[archetype]
  const ownTerms = getBuildingArchetypeSearchTerms(archetype)

  if (!('manifestationOf' in entry) || !entry.manifestationOf) {
    return ownTerms
  }

  const root = entry.manifestationOf as BuildingArchetype
  const rootEntry = BUILDING_ARCHETYPE_ENTRIES[root]
  const inherited = [
    rootEntry.label,
    ...getBuildingArchetypeAliases(root),
    ...getBuildingArchetypeSearchTerms(root),
  ]

  return normalizeDiscoveryTerms([...ownTerms, ...inherited])
}

/** Walks manifestationOf links to the root archetype. */
export function getBuildingManifestationRoot(archetype: BuildingArchetype): BuildingArchetype {
  let current: BuildingArchetype = archetype
  const visited = new Set<BuildingArchetype>([current])

  while (true) {
    const entry = BUILDING_ARCHETYPE_ENTRIES[current]
    const parent =
      'manifestationOf' in entry && entry.manifestationOf
        ? (entry.manifestationOf as BuildingArchetype)
        : undefined
    if (!parent || visited.has(parent)) {
      return current
    }
    visited.add(parent)
    current = parent
  }
}

/** Joins function family labels for display (e.g. "Lodging · Food & drink"). */
export function formatBuildingFunctionFamilyLabels(
  functions: readonly BuildingFunctionFamily[],
): string {
  return functions.map((fn) => BUILDING_FUNCTION_FAMILY_ENTRIES[fn].label).join(' · ')
}
