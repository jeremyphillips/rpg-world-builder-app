import { keysFromEntries, vocabEnumFromEntries } from '../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../types'

export const SITE_TYPE_TERM = {
  label: 'Site Type',
  description: 'The character of a specific place or point of interest.',
  sentence: {
    singular: 'site type',
    plural: 'site types',
  },
} as const satisfies VocabularyTerm

export const SITE_TYPE_ENTRIES = {
  landmark: {
    label: 'Landmark',
    description: 'A notable natural or constructed feature used for navigation.',
  },
  ruin: {
    label: 'Ruin',
    description: 'The remains of a former settlement, structure, or monument.',
  },
  dungeon: {
    label: 'Dungeon',
    description: 'An adventure site such as a tomb, cavern complex, or stronghold.',
  },
  wilderness: {
    label: 'Wilderness',
    description: 'An untamed tract of land without a fixed structure.',
  },
  road: {
    label: 'Road',
    description: 'A traveled route such as a highway, trail, or pass.',
  },
  crossing: {
    label: 'Crossing',
    description: 'A bridge, ford, or other passage over an obstacle.',
  },
  battlefield: {
    label: 'Battlefield',
    description: 'A site marked by a significant battle or siege.',
  },
  sacred_ground: {
    label: 'Sacred Ground',
    description: 'A shrine, grove, cemetery, or other consecrated place.',
  },
  mine: {
    label: 'Mine',
    description: 'An excavation or quarry worked for resources.',
  },
  camp: {
    label: 'Camp',
    description: 'A temporary or semi-permanent encampment.',
  },
} as const satisfies Record<string, GameTermEntry>

export type SiteType = keyof typeof SITE_TYPE_ENTRIES

export const SITE_TYPE_IDS = keysFromEntries(SITE_TYPE_ENTRIES)

export const siteTypeSchema = vocabEnumFromEntries(SITE_TYPE_ENTRIES)

/** Returns the reference entry for a site type id, if known. */
export function getSiteTypeEntry(id: string): GameTermEntry | undefined {
  return SITE_TYPE_ENTRIES[id as SiteType]
}

/** Returns the display label for a site type. Falls back to the raw id. */
export function getSiteTypeLabel(id: string): string {
  return getSiteTypeEntry(id)?.label ?? id
}
