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
    description: 'A notable place or feature recognized as a distinct destination.',
  },
  ruin: {
    label: 'Ruin',
    description: 'The remains of a former settlement, structure, or constructed site.',
  },
  dungeon: {
    label: 'Dungeon',
    description: 'A discrete adventure site intended for exploration or encounter play.',
  },
  route: {
    label: 'Route',
    description: 'A traveled path or corridor such as a road, trail, pass, or trade route.',
  },
  crossing: {
    label: 'Crossing',
    description: 'A notable passage across or through a geographic obstacle.',
  },
  battlefield: {
    label: 'Battlefield',
    description: 'A place defined by a significant battle, siege, or military event.',
  },
  sacred_ground: {
    label: 'Sacred Ground',
    description: 'A consecrated or culturally sacred place defined primarily by its location.',
  },
  mine: {
    label: 'Mine',
    description: 'A site where stone, ore, or other resources are extracted.',
  },
  camp: {
    label: 'Camp',
    description: 'A temporary or semi-permanent encampment.',
  },
  other: {
    label: 'Other',
    description: 'Another type of discrete site.',
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
