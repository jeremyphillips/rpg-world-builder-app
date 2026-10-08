import { CLASS_SPELLCASTING_CHOICE_SUFFIXES, type ChoiceSet } from '@rpg/contracts'
import { CATALOG_PICKER_ADD_LABEL, CATALOG_PICKER_REMOVE_LABEL } from '@rpg/ui'
import { describe, expect, it } from 'vitest'

import { resolvePickerMutationCopy } from '../../../lib/picker/picker-mutation-family'
import {
  resolveSpellPickerAction,
  resolveSpellPickerMutationFamily,
  resolveSpellPickerSelectionMode,
  resolveSpellPickerSelectionStateLine,
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

describe('resolveSpellPickerMutationFamily', () => {
  it('maps cantrips to generic selection and spellbook to learned spells', () => {
    expect(resolveSpellPickerMutationFamily(SPELL_PICKER_SELECTION_CANTRIP)).toBe(
      'genericSelection',
    )
    expect(resolveSpellPickerMutationFamily(SPELL_PICKER_SELECTION_SPELLBOOK)).toBe('learnedSpell')
    expect(resolveSpellPickerMutationFamily(SPELL_PICKER_SELECTION_KNOWN)).toBe('learnedSpell')
    expect(resolveSpellPickerMutationFamily(SPELL_PICKER_SELECTION_PREPARED)).toBe('preparedSpell')
  })
})

describe('resolveSpellPickerAction', () => {
  it('uses Prepare and Unprepare for prepared spells', () => {
    const prepared = resolvePickerMutationCopy('preparedSpell')
    expect(
      resolveSpellPickerAction({ selectionMode: SPELL_PICKER_SELECTION_PREPARED, selected: false }),
    ).toBe(prepared.acquire)
    expect(
      resolveSpellPickerAction({ selectionMode: SPELL_PICKER_SELECTION_PREPARED, selected: true }),
    ).toBe(prepared.release)
  })

  it('uses Learn and Unlearn for known and spellbook spells', () => {
    const learned = resolvePickerMutationCopy('learnedSpell')
    expect(
      resolveSpellPickerAction({ selectionMode: SPELL_PICKER_SELECTION_KNOWN, selected: false }),
    ).toBe(learned.acquire)
    expect(
      resolveSpellPickerAction({ selectionMode: SPELL_PICKER_SELECTION_KNOWN, selected: true }),
    ).toBe(learned.release)
    expect(
      resolveSpellPickerAction({
        selectionMode: SPELL_PICKER_SELECTION_SPELLBOOK,
        selected: true,
      }),
    ).toBe(learned.release)
    expect(learned.release).toBe('Unlearn')
  })

  it('uses Add and Remove for cantrips', () => {
    expect(
      resolveSpellPickerAction({ selectionMode: SPELL_PICKER_SELECTION_CANTRIP, selected: false }),
    ).toBe(CATALOG_PICKER_ADD_LABEL)
    expect(
      resolveSpellPickerAction({ selectionMode: SPELL_PICKER_SELECTION_CANTRIP, selected: true }),
    ).toBe(CATALOG_PICKER_REMOVE_LABEL)
  })
})

describe('resolveSpellPickerSelectionStateLine', () => {
  it('uses the family state word for the active mode', () => {
    expect(resolveSpellPickerSelectionStateLine(SPELL_PICKER_SELECTION_PREPARED)).toEqual({
      label: 'Prepared',
    })
    expect(resolveSpellPickerSelectionStateLine(SPELL_PICKER_SELECTION_KNOWN)).toEqual({
      label: 'Learned',
    })
    expect(resolveSpellPickerSelectionStateLine(SPELL_PICKER_SELECTION_CANTRIP)).toEqual({
      label: 'Selected',
    })
  })
})
