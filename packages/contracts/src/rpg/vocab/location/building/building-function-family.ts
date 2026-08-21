/**
 * Canonical function-family vocabulary for Model E building classification.
 *
 * Ids are persisted vocabulary — established in Phase 5 curation (2026-08-03).
 * Future renames or removals require deliberate migration; do not treat these
 * ids as provisional.
 */
import { keysFromEntries, vocabEnumFromEntries } from '../../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../../types'

export const BUILDING_FUNCTION_FAMILY_TERM = {
  label: 'Building Function Family',
  description: 'Semantic function families a building facility normally serves.',
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
  production: {
    label: 'Production',
    description: 'Manufacturing, processing, or material transformation.',
  },
  storage: {
    label: 'Storage',
    description: 'Goods, materials, or cargo held for later use or transfer.',
  },
  finance: {
    label: 'Finance',
    description: 'Banking, minting, exchange, or other monetary operations.',
  },
  governance: {
    label: 'Governance',
    description: 'Administration, authority, adjudication, or custody.',
  },
  worship: {
    label: 'Worship',
    description: 'Religious devotion, ceremony, or sacred community.',
  },
  cloistered_community: {
    label: 'Cloistered community',
    description: 'Enclosed or monastic communal life.',
  },
  assembly: {
    label: 'Assembly',
    description: 'Gathering members, delegates, or organized groups.',
  },
  knowledge: {
    label: 'Knowledge',
    description: 'Study, records, teaching, or curated information.',
  },
  care: {
    label: 'Care',
    description: 'Healing, welfare, bathing, or aid for people in need.',
  },
  defense_watch: {
    label: 'Defense & watch',
    description: 'Military garrison, guard, or defensive readiness.',
  },
  spectacle: {
    label: 'Spectacle',
    description: 'Performance, games, display, or public entertainment.',
  },
  transport_support: {
    label: 'Transport support',
    description: 'Travel relay, waystation, or mount-and-caravan support.',
  },
  funerary: {
    label: 'Funerary',
    description: 'Burial, commemoration, or mortuary rites.',
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

export function formatBuildingFunctionFamilyLabels(
  functions: readonly BuildingFunctionFamily[],
): string {
  return functions.map(getBuildingFunctionFamilyLabel).join(' · ')
}
