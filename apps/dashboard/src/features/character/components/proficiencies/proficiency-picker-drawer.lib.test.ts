import { describe, expect, it } from 'vitest'

import {
  proficiencyPickerAcrobaticsOptionId,
  proficiencyPickerItemsFixture,
  proficiencyPickerOpenItemsFixture,
  proficiencyPickerPerceptionOptionId,
  proficiencyPickerSkillChoiceSetFixture,
  proficiencyPickerStealthOptionId,
} from './proficiency-picker-drawer.fixtures'
import {
  formatProficiencyPickerDrawerDescription,
  formatProficiencyPickerDrawerTitle,
  formatProficiencyPickerSearchPlaceholder,
  getProficiencyPickerDisabledNote,
  isProficiencyPickerRowDimmed,
  resolveProficiencyPickerEmptyStateKind,
  resolveProficiencyPickerEmptyStateMessage,
} from './proficiency-picker-drawer.lib'
import {
  PROFICIENCY_PICKER_NO_OPTIONS_MESSAGE,
  PROFICIENCY_PICKER_SELECTION_FULL_MESSAGE,
} from './proficiency-picker-drawer.types'

describe('proficiency-picker-drawer.lib', () => {
  it('formats drawer title, description, and search placeholder from the ChoiceSet', () => {
    expect(formatProficiencyPickerDrawerTitle(proficiencyPickerSkillChoiceSetFixture, [])).toBe(
      'Add skill proficiency',
    )
    expect(
      formatProficiencyPickerDrawerTitle(proficiencyPickerSkillChoiceSetFixture, [
        proficiencyPickerStealthOptionId,
        proficiencyPickerAcrobaticsOptionId,
      ]),
    ).toBe('Manage skill choices')
    expect(
      formatProficiencyPickerDrawerDescription(proficiencyPickerSkillChoiceSetFixture, [
        proficiencyPickerStealthOptionId,
        proficiencyPickerAcrobaticsOptionId,
      ]),
    ).toBe('Selected 2 of 2. Remove a selection to choose another.')
    expect(
      formatProficiencyPickerDrawerDescription(proficiencyPickerSkillChoiceSetFixture, [
        proficiencyPickerStealthOptionId,
      ]),
    ).toBe('Selected 1 of 2. Choose 1 more.')
    expect(formatProficiencyPickerSearchPlaceholder(proficiencyPickerSkillChoiceSetFixture)).toBe(
      'Search skills',
    )
  })

  it('resolves empty-state kinds for no options and selection full', () => {
    expect(
      resolveProficiencyPickerEmptyStateKind(0, proficiencyPickerSkillChoiceSetFixture, []),
    ).toBe('no-options')
    expect(
      resolveProficiencyPickerEmptyStateKind(0, proficiencyPickerSkillChoiceSetFixture, [
        proficiencyPickerStealthOptionId,
        proficiencyPickerAcrobaticsOptionId,
      ]),
    ).toBe('selection-full')
    expect(resolveProficiencyPickerEmptyStateMessage('no-options')).toBe(
      PROFICIENCY_PICKER_NO_OPTIONS_MESSAGE,
    )
    expect(resolveProficiencyPickerEmptyStateMessage('selection-full')).toBe(
      PROFICIENCY_PICKER_SELECTION_FULL_MESSAGE,
    )
  })

  it('dims only unselected rows that cannot be selected', () => {
    const selected = proficiencyPickerItemsFixture.find(
      (item) => item.optionId === proficiencyPickerStealthOptionId,
    )!
    const blocked = proficiencyPickerItemsFixture.find(
      (item) => item.optionId === proficiencyPickerPerceptionOptionId,
    )!

    expect(isProficiencyPickerRowDimmed(selected)).toBe(false)
    expect(isProficiencyPickerRowDimmed(blocked)).toBe(true)
    expect(getProficiencyPickerDisabledNote(blocked)).toBe('Selection full')
  })

  it('keeps open picker rows selectable', () => {
    const item = proficiencyPickerOpenItemsFixture[0]!
    expect(isProficiencyPickerRowDimmed(item)).toBe(false)
    expect(getProficiencyPickerDisabledNote(item)).toBeUndefined()
  })
})
