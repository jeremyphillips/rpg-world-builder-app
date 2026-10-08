import { CLASS_SPELLCASTING_CHOICE_SUFFIXES, type ChoiceSet } from '@rpg/contracts'

export const SPELL_PICKER_ACTION_ADD = 'Add'
export const SPELL_PICKER_ACTION_REMOVE = 'Remove'
export const SPELL_PICKER_ACTION_PREPARE = 'Prepare'
export const SPELL_PICKER_ACTION_UNPREPARE = 'Unprepare'
export const SPELL_PICKER_ACTION_LEARN = 'Learn'
export const SPELL_PICKER_ACTION_FORGET = 'Forget'
export const SPELL_PICKER_ACTION_UNLEARN = 'Unlearn'

export const SPELL_PICKER_SELECTION_PREPARED = 'prepared' as const
export const SPELL_PICKER_SELECTION_KNOWN = 'known' as const
export const SPELL_PICKER_SELECTION_SPELLBOOK = 'spellbook' as const
export const SPELL_PICKER_SELECTION_CANTRIP = 'cantrip' as const

export type SpellPickerSelectionMode =
  | typeof SPELL_PICKER_SELECTION_PREPARED
  | typeof SPELL_PICKER_SELECTION_KNOWN
  | typeof SPELL_PICKER_SELECTION_SPELLBOOK
  | typeof SPELL_PICKER_SELECTION_CANTRIP

const SPELL_PICKER_ACTION_LABELS: Record<
  SpellPickerSelectionMode,
  { addLabel: string; removeLabel: string }
> = {
  [SPELL_PICKER_SELECTION_PREPARED]: {
    addLabel: SPELL_PICKER_ACTION_PREPARE,
    removeLabel: SPELL_PICKER_ACTION_UNPREPARE,
  },
  [SPELL_PICKER_SELECTION_KNOWN]: {
    addLabel: SPELL_PICKER_ACTION_LEARN,
    removeLabel: SPELL_PICKER_ACTION_FORGET,
  },
  [SPELL_PICKER_SELECTION_SPELLBOOK]: {
    addLabel: SPELL_PICKER_ACTION_LEARN,
    removeLabel: SPELL_PICKER_ACTION_UNLEARN,
  },
  [SPELL_PICKER_SELECTION_CANTRIP]: {
    addLabel: SPELL_PICKER_ACTION_ADD,
    removeLabel: SPELL_PICKER_ACTION_REMOVE,
  },
}

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

/** Visible row verb for the current selection context. */
export function resolveSpellPickerAction(args: {
  selectionMode: SpellPickerSelectionMode
  selected: boolean
}): string {
  const labels = SPELL_PICKER_ACTION_LABELS[args.selectionMode]
  return args.selected ? labels.removeLabel : labels.addLabel
}
