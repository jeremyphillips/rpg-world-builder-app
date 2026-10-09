import { getContentTypeSentenceForm, PICKER_DISABLED_REASON_SELECTION_FULL } from '@rpg/contracts'
import { CATALOG_PICKER_ADD_LABEL, CATALOG_PICKER_REMOVE_LABEL } from '@rpg/ui'

/** Vocabulary only. Callers choose acquire or release from their own domain flag. */
export const PICKER_MUTATION_FAMILY_IDS = [
  'genericSelection',
  'learnedSpell',
  'preparedSpell',
] as const

export type PickerMutationFamilyId = (typeof PICKER_MUTATION_FAMILY_IDS)[number]

export type PickerMutationDirection = 'acquire' | 'release'

/** Skills, languages, tools, and cantrips share this noun. Spell families use the catalog term. */
const GENERIC_SELECTION_NOUN = 'selection'

export const PICKER_MUTATION_FAMILIES = {
  genericSelection: {
    acquire: CATALOG_PICKER_ADD_LABEL,
    acquiring: 'adding',
    state: 'Selected',
    release: CATALOG_PICKER_REMOVE_LABEL,
    releasing: 'removing',
  },
  learnedSpell: {
    acquire: 'Learn',
    acquiring: 'learning',
    state: 'Learned',
    release: 'Unlearn',
    releasing: 'unlearning',
  },
  preparedSpell: {
    acquire: 'Prepare',
    acquiring: 'preparing',
    state: 'Prepared',
    release: 'Unprepare',
    releasing: 'unpreparing',
  },
} as const

export type PickerMutationCopy = {
  acquire: string
  acquiring: string
  state: string
  release: string
  releasing: string
}

export type PickerCapacityTooltip = {
  title: string
  body: string
}

export function resolvePickerMutationCopy(familyId: PickerMutationFamilyId): PickerMutationCopy {
  return PICKER_MUTATION_FAMILIES[familyId]
}

function capitalizeProgressive(progressive: string): string {
  return `${progressive.charAt(0).toUpperCase()}${progressive.slice(1)}`
}

/** Pending copy is the stored progressive, capitalized, with an ellipsis. */
export function resolvePickerPendingLabel(
  familyId: PickerMutationFamilyId,
  direction: PickerMutationDirection,
): string {
  const copy = resolvePickerMutationCopy(familyId)
  const progressive = direction === 'acquire' ? copy.acquiring : copy.releasing
  return `${capitalizeProgressive(progressive)}…`
}

export function resolvePickerCapacityTooltip(
  familyId: PickerMutationFamilyId,
): PickerCapacityTooltip {
  const copy = resolvePickerMutationCopy(familyId)
  const noun =
    familyId === 'genericSelection'
      ? GENERIC_SELECTION_NOUN
      : getContentTypeSentenceForm('spells', 1)

  return {
    title: PICKER_DISABLED_REASON_SELECTION_FULL,
    body: `${copy.release} a ${noun} before ${copy.acquiring} another.`,
  }
}
