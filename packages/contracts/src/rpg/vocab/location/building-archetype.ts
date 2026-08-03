/**
 * Building archetype registry for Model E classification.
 *
 * Archetype ids are persisted vocabulary — established in Phase 6 curation
 * (2026-08-03). Future renames or removals require deliberate migration.
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
  readonly searchTerms?: readonly string[]
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

/** Returns normalized search terms for an archetype, if any. */
export function getBuildingArchetypeSearchTerms(archetype: BuildingArchetype): readonly string[] {
  const entry = BUILDING_ARCHETYPE_ENTRIES[archetype]
  return 'searchTerms' in entry && entry.searchTerms ? entry.searchTerms : []
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
