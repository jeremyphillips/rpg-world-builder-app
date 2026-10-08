import { CLASS_SPELLCASTING_CHOICE_SUFFIXES, type ChoiceSet } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import {
  resolveSpellPickerAction,
  resolveSpellPickerSelectionMode,
  SPELL_PICKER_ACTION_ADD,
  SPELL_PICKER_ACTION_FORGET,
  SPELL_PICKER_ACTION_LEARN,
  SPELL_PICKER_ACTION_PREPARE,
  SPELL_PICKER_ACTION_REMOVE,
  SPELL_PICKER_ACTION_UNPREPARE,
  SPELL_PICKER_SELECTION_CANTRIP,
  SPELL_PICKER_SELECTION_KNOWN,
  SPELL_PICKER_SELECTION_PREPARED,
  SPELL_PICKER_SELECTION_SPELLBOOK,
} from './spell-picker-action.lib'

function choiceSet(suffix: string, choiceType: ChoiceSet['choiceType']): ChoiceSet {
  return {
    id: `spellcasting:srd-cc-5.2.1:wizard:${suffix}`,
    sourceType: 'spellcasting',
    sourceId: 'srd-cc-5.2.1:wizard',
    choiceType,
    label: 'Spells',
    min: 1,
    max: 1,
    options: [],
    required: true,
  }
}

describe('resolveSpellPickerSelectionMode', () => {
  it('maps prepared, repertoire, and spellbook suffixes', () => {
    expect(
      resolveSpellPickerSelectionMode(
        choiceSet(CLASS_SPELLCASTING_CHOICE_SUFFIXES.prepared, 'spell'),
      ),
    ).toBe(SPELL_PICKER_SELECTION_PREPARED)
    expect(
      resolveSpellPickerSelectionMode(
        choiceSet(CLASS_SPELLCASTING_CHOICE_SUFFIXES.repertoire, 'spell'),
      ),
    ).toBe(SPELL_PICKER_SELECTION_KNOWN)
    expect(
      resolveSpellPickerSelectionMode(
        choiceSet(CLASS_SPELLCASTING_CHOICE_SUFFIXES.spellbook, 'spell'),
      ),
    ).toBe(SPELL_PICKER_SELECTION_SPELLBOOK)
  })

  it('treats cantrips and missing choice sets as cantrip', () => {
    expect(
      resolveSpellPickerSelectionMode(
        choiceSet(CLASS_SPELLCASTING_CHOICE_SUFFIXES.cantrips, 'cantrip'),
      ),
    ).toBe(SPELL_PICKER_SELECTION_CANTRIP)
    expect(resolveSpellPickerSelectionMode(undefined)).toBe(SPELL_PICKER_SELECTION_CANTRIP)
  })

  it('falls back to prepared for an unknown spell suffix', () => {
    expect(resolveSpellPickerSelectionMode(choiceSet('custom', 'spell'))).toBe(
      SPELL_PICKER_SELECTION_PREPARED,
    )
  })
})

describe('resolveSpellPickerAction', () => {
  it('uses Prepare and Unprepare for prepared spells', () => {
    expect(
      resolveSpellPickerAction({ selectionMode: SPELL_PICKER_SELECTION_PREPARED, selected: false }),
    ).toBe(SPELL_PICKER_ACTION_PREPARE)
    expect(
      resolveSpellPickerAction({ selectionMode: SPELL_PICKER_SELECTION_PREPARED, selected: true }),
    ).toBe(SPELL_PICKER_ACTION_UNPREPARE)
  })

  it('uses Learn and Forget for known spells', () => {
    expect(
      resolveSpellPickerAction({ selectionMode: SPELL_PICKER_SELECTION_KNOWN, selected: false }),
    ).toBe(SPELL_PICKER_ACTION_LEARN)
    expect(
      resolveSpellPickerAction({ selectionMode: SPELL_PICKER_SELECTION_KNOWN, selected: true }),
    ).toBe(SPELL_PICKER_ACTION_FORGET)
  })

  it('uses Add and Remove for spellbook acquisition and cantrips', () => {
    expect(
      resolveSpellPickerAction({
        selectionMode: SPELL_PICKER_SELECTION_SPELLBOOK,
        selected: false,
      }),
    ).toBe(SPELL_PICKER_ACTION_ADD)
    expect(
      resolveSpellPickerAction({ selectionMode: SPELL_PICKER_SELECTION_SPELLBOOK, selected: true }),
    ).toBe(SPELL_PICKER_ACTION_REMOVE)
    expect(
      resolveSpellPickerAction({ selectionMode: SPELL_PICKER_SELECTION_CANTRIP, selected: false }),
    ).toBe(SPELL_PICKER_ACTION_ADD)
    expect(
      resolveSpellPickerAction({ selectionMode: SPELL_PICKER_SELECTION_CANTRIP, selected: true }),
    ).toBe(SPELL_PICKER_ACTION_REMOVE)
  })
})
