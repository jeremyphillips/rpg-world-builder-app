/**
 * Working function-family vocabulary for Model E building classification.
 *
 * These ids are scaffolding for seed archetypes and override tests — not the
 * canonical family set. Phase 5 may rename, collapse, or replace every id here.
 * Downstream code must treat these values as provisional.
 */
import { keysFromEntries, vocabEnumFromEntries } from '../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../types'

export const BUILDING_FUNCTION_FAMILY_TERM = {
  label: 'Building Function Family',
  description: 'Semantic function families a building archetype normally serves.',
  sentence: {
    singular: 'building function family',
    plural: 'building function families',
  },
} as const satisfies VocabularyTerm

export const BUILDING_FUNCTION_FAMILY_ENTRIES = {
  dwelling: {
    label: 'Dwelling',
    description: 'Primary residential occupation for occupants.',
  },
  lodging: {
    label: 'Lodging',
    description: 'Short-term guest accommodation and hospitality.',
  },
  food_drink_social: {
    label: 'Food & drink',
    description: 'Food, drink, and social gathering.',
  },
  retail: {
    label: 'Retail',
    description: 'Goods sold directly to visitors or travelers.',
  },
  service: {
    label: 'Service',
    description: 'Specialized care, craft, or maintenance work for others.',
  },
  storage: {
    label: 'Storage',
    description: 'Goods, materials, or cargo held for later use or transfer.',
  },
  assembly: {
    label: 'Assembly',
    description: 'Gathering members, delegates, or organized groups.',
  },
  governance: {
    label: 'Governance',
    description: 'Administration, authority, or civic leadership.',
  },
  worship: {
    label: 'Worship',
    description: 'Religious devotion, ceremony, or sacred community.',
  },
  knowledge: {
    label: 'Knowledge',
    description: 'Study, records, teaching, or curated information.',
  },
  care: {
    label: 'Care',
    description: 'Healing, aid, or welfare for people in need.',
  },
} as const satisfies Record<string, GameTermEntry>

export type BuildingFunctionFamily = keyof typeof BUILDING_FUNCTION_FAMILY_ENTRIES

export const BUILDING_FUNCTION_FAMILY_IDS = keysFromEntries(BUILDING_FUNCTION_FAMILY_ENTRIES)

export const buildingFunctionFamilySchema = vocabEnumFromEntries(BUILDING_FUNCTION_FAMILY_ENTRIES)

/** Returns the reference entry for a function family id, if known. */
export function getBuildingFunctionFamilyEntry(id: string): GameTermEntry | undefined {
  return BUILDING_FUNCTION_FAMILY_ENTRIES[id as BuildingFunctionFamily]
}

/** Returns the display label for a function family. Falls back to the raw id. */
export function getBuildingFunctionFamilyLabel(id: string): string {
  return getBuildingFunctionFamilyEntry(id)?.label ?? id
}
