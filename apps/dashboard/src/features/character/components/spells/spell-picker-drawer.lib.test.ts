import { describe, expect, it } from 'vitest'

import {
  spellPickerCantripChoiceSetFixture,
  spellPickerCureWoundsFixture,
  spellPickerDetectMagicFixture,
} from './spell-picker-drawer.fixtures'
import {
  collectSpellPickerMarkers,
  formatSpellPickerDrawerDescription,
  formatSpellPickerDrawerTitle,
  getSpellPickerDisabledNote,
  isSpellPickerRowDimmed,
  resolveSpellPickerEmptyStateKind,
  resolveSpellPickerEmptyStateMessage,
  splitSpellDescriptionHtml,
} from './spell-picker-drawer.lib'
import {
  SPELL_PICKER_NO_OPTIONS_MESSAGE,
  SPELL_PICKER_SELECTION_FULL_MESSAGE,
} from './spell-picker-drawer.types'

describe('spell-picker-drawer.lib', () => {
  it('splits higher-level spell slot prose from the main description', () => {
    expect(splitSpellDescriptionHtml(spellPickerCureWoundsFixture.description ?? '')).toEqual({
      mainHtml: '<p>A creature you touch regains 2d8 + modifier Hit Points.</p>',
      higherLevelHtml:
        '<p><strong>Using a Higher-Level Spell Slot.</strong> The healing increases by 2d8 for each spell slot level above 1.</p>',
    })
  })

  it('collects concentration and ritual markers', () => {
    expect(collectSpellPickerMarkers(spellPickerDetectMagicFixture)).toEqual([
      'Concentration',
      'Ritual',
    ])
  })

  it('formats drawer title and description from the ChoiceSet', () => {
    expect(formatSpellPickerDrawerTitle(spellPickerCantripChoiceSetFixture)).toBe('Add cantrip')
    expect(formatSpellPickerDrawerDescription(spellPickerCantripChoiceSetFixture, ['a', 'b'])).toBe(
      'Selected 2 of 2. Remove a spell to choose another.',
    )
    expect(formatSpellPickerDrawerDescription(spellPickerCantripChoiceSetFixture, ['a'])).toBe(
      'Selected 1 of 2. Choose 1 more.',
    )
  })

  it('resolves empty-state kinds for no options and selection full', () => {
    expect(resolveSpellPickerEmptyStateKind(0, spellPickerCantripChoiceSetFixture, [])).toBe(
      'no-options',
    )
    expect(
      resolveSpellPickerEmptyStateKind(0, spellPickerCantripChoiceSetFixture, ['a', 'b']),
    ).toBe('selection-full')
    expect(resolveSpellPickerEmptyStateMessage('no-options')).toBe(SPELL_PICKER_NO_OPTIONS_MESSAGE)
    expect(resolveSpellPickerEmptyStateMessage('selection-full')).toBe(
      SPELL_PICKER_SELECTION_FULL_MESSAGE,
    )
  })

  it('dims only unselected rows that cannot be selected', () => {
    const selected = {
      state: {
        isAlreadySelected: true,
        canSelect: false,
        disabledReasons: [],
      },
    }
    const blocked = {
      state: {
        isAlreadySelected: false,
        canSelect: false,
        disabledReasons: ['Selection full'],
      },
    }

    expect(isSpellPickerRowDimmed(selected as never)).toBe(false)
    expect(isSpellPickerRowDimmed(blocked as never)).toBe(true)
    expect(getSpellPickerDisabledNote(blocked as never)).toBe('Selection full')
  })
})
