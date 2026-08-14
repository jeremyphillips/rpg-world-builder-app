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
    description: 'A compact enclosed form with recognizable house massing, independent of use.',
  },
  tower: {
    label: 'Tower',
    description: 'A tall, vertically emphasized form, independent of use.',
  },
  hall: {
    label: 'Hall',
    description:
      'A form organized around a dominant hall volume, rather than merely containing a hall room.',
  },
  keep: {
    label: 'Keep',
    description:
      'A compact, thick-walled form organized around a dominant central block, independent of use.',
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
