import { CATALOG_PICKER_ADD_LABEL, CATALOG_PICKER_REMOVE_LABEL } from '@rpg/ui'

/** Vocabulary only. Callers choose acquire or release from their own domain flag. */
export const PICKER_MUTATION_FAMILY_IDS = [
  'genericSelection',
  'learnedSpell',
  'preparedSpell',
] as const

export type PickerMutationFamilyId = (typeof PICKER_MUTATION_FAMILY_IDS)[number]

export const PICKER_MUTATION_FAMILIES = {
  genericSelection: {
    acquire: CATALOG_PICKER_ADD_LABEL,
    state: 'Selected',
    release: CATALOG_PICKER_REMOVE_LABEL,
  },
  learnedSpell: {
    acquire: 'Learn',
    state: 'Learned',
    release: 'Unlearn',
  },
  preparedSpell: {
    acquire: 'Prepare',
    state: 'Prepared',
    release: 'Unprepare',
  },
} as const

export type PickerMutationCopy = {
  acquire: string
  state: string
  release: string
}

export function resolvePickerMutationCopy(familyId: PickerMutationFamilyId): PickerMutationCopy {
  return PICKER_MUTATION_FAMILIES[familyId]
}
