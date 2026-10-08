import { CLASS_SPELLCASTING_CHOICE_SUFFIXES, type ChoiceSet } from '@rpg/contracts'

import {
  resolvePickerMutationCopy,
  type PickerMutationFamilyId,
} from '../../../lib/picker/picker-mutation-family'
import {
  resolvePickerSelectionStateLine,
  type PickerSelectionStateKind,
} from '../../../lib/picker/picker-selection-state'

export const SPELL_PICKER_SELECTION_PREPARED = 'prepared' as const
export const SPELL_PICKER_SELECTION_KNOWN = 'known' as const
export const SPELL_PICKER_SELECTION_SPELLBOOK = 'spellbook' as const
export const SPELL_PICKER_SELECTION_CANTRIP = 'cantrip' as const

export type SpellPickerSelectionMode =
  | typeof SPELL_PICKER_SELECTION_PREPARED
  | typeof SPELL_PICKER_SELECTION_KNOWN
  | typeof SPELL_PICKER_SELECTION_SPELLBOOK
  | typeof SPELL_PICKER_SELECTION_CANTRIP

const SPELL_PICKER_MUTATION_FAMILY = {
  [SPELL_PICKER_SELECTION_PREPARED]: 'preparedSpell',
  [SPELL_PICKER_SELECTION_KNOWN]: 'learnedSpell',
  [SPELL_PICKER_SELECTION_SPELLBOOK]: 'learnedSpell',
  [SPELL_PICKER_SELECTION_CANTRIP]: 'genericSelection',
} as const satisfies Record<SpellPickerSelectionMode, PickerMutationFamilyId>

const SPELL_PICKER_SELECTION_KIND = {
  genericSelection: 'selected',
  learnedSpell: 'learned',
  preparedSpell: 'prepared',
} as const satisfies Record<PickerMutationFamilyId, Exclude<PickerSelectionStateKind, 'owned'>>

function choiceSetSuffix(choiceSetId: string): string | undefined {
  const parts = choiceSetId.split(':')
  return parts[parts.length - 1]
}

/** Selection context from the choice-set id suffix. Unknown spell suffixes are prepared. */
export function resolveSpellPickerSelectionMode(
  choiceSet: Pick<ChoiceSet, 'id' | 'choiceType'> | undefined,
): SpellPickerSelectionMode {
  if (!choiceSet || choiceSet.choiceType === 'cantrip') {
    return SPELL_PICKER_SELECTION_CANTRIP
  }

  const suffix = choiceSetSuffix(choiceSet.id)
  if (suffix === CLASS_SPELLCASTING_CHOICE_SUFFIXES.spellbook) {
    return SPELL_PICKER_SELECTION_SPELLBOOK
  }
  if (suffix === CLASS_SPELLCASTING_CHOICE_SUFFIXES.repertoire) {
    return SPELL_PICKER_SELECTION_KNOWN
  }
  if (suffix === CLASS_SPELLCASTING_CHOICE_SUFFIXES.cantrips) {
    return SPELL_PICKER_SELECTION_CANTRIP
  }

  return SPELL_PICKER_SELECTION_PREPARED
}

/** Prepared, known, and spellbook map onto a mutation family. Cantrips stay generic. */
export function resolveSpellPickerMutationFamily(
  selectionMode: SpellPickerSelectionMode,
): PickerMutationFamilyId {
  return SPELL_PICKER_MUTATION_FAMILY[selectionMode]
}

export function resolveSpellPickerSelectionStateKind(
  selectionMode: SpellPickerSelectionMode,
): Exclude<PickerSelectionStateKind, 'owned'> {
  return SPELL_PICKER_SELECTION_KIND[resolveSpellPickerMutationFamily(selectionMode)]
}

/** Visible row verb for the current selection context. The caller supplies `selected`. */
export function resolveSpellPickerAction(args: {
  selectionMode: SpellPickerSelectionMode
  selected: boolean
}): string {
  const copy = resolvePickerMutationCopy(resolveSpellPickerMutationFamily(args.selectionMode))
  return args.selected ? copy.release : copy.acquire
}

export function resolveSpellPickerSelectionStateLine(selectionMode: SpellPickerSelectionMode) {
  return resolvePickerSelectionStateLine({
    kind: resolveSpellPickerSelectionStateKind(selectionMode),
  })
}
