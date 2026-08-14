import { keysFromEntries, vocabEnumFromEntries } from '../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../types'

export const BUILDING_FORM_TERM = {
  label: 'Building Form',
  description: 'The physical or architectural morphology of a building.',
  sentence: {
    singular: 'building form',
    plural: 'building forms',
  },
} as const satisfies VocabularyTerm

export const BUILDING_FORM_ENTRIES = {
  house: {
    label: 'House',
    description:
      'A small-scale enclosed building with a recognizable house envelope and massing, independent of its present use.',
  },
  tower: {
    label: 'Tower',
    description:
      'A tall, vertically emphasized built form, independent of watch, defense, residence, or other use.',
  },
  hall: {
    label: 'Hall',
    description:
      'A building architecturally organized around a dominant hall volume, not merely a building that contains a hall room. Independent of civic, ceremonial, or commercial facility identity.',
  },
} as const satisfies Record<string, GameTermEntry>

export type BuildingForm = keyof typeof BUILDING_FORM_ENTRIES

export const BUILDING_FORM_IDS = keysFromEntries(BUILDING_FORM_ENTRIES)

export const buildingFormSchema = vocabEnumFromEntries(BUILDING_FORM_ENTRIES)

export function getBuildingFormEntry(id: string): GameTermEntry | undefined {
  return BUILDING_FORM_ENTRIES[id as BuildingForm]
}

export function getBuildingFormLabel(id: string): string {
  return getBuildingFormEntry(id)?.label ?? id
}
