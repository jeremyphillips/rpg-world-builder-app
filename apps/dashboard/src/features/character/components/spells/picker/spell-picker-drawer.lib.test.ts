import { buildSpellPickerCompactSummary } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import {
  spellPickerCantripChoiceSetFixture,
  spellPickerDetectMagicFixture,
} from './spell-picker-drawer.fixtures'
import {
  collectSpellPickerMarkers,
  formatSpellPickerDrawerTitle,
  formatSpellPickerSelectionCountText,
  formatSpellPickerSelectionMetadata,
  getSpellPickerCastingTimeFilterLabel,
  matchesSpellPickerMechanicsFilters,
  normalizeSpellPickerLevelSelection,
  resolveActivePreparedLevelSuffix,
  resolveSpellPickerEmptyStateKind,
  resolveSpellPickerEmptyStateMessage,
  resolveSpellPickerLevelChipChange,
  resolveValidSpellPickerSort,
  toggleSpellPickerLevelSelection,
} from './spell-picker-drawer.lib'
import {
  SPELL_PICKER_LEVELS_ALL,
  SPELL_PICKER_MODE_CANTRIPS,
  SPELL_PICKER_MODE_PREPARED_SPELLS,
  SPELL_PICKER_NO_OPTIONS_MESSAGE,
  SPELL_PICKER_SELECTION_FULL_MESSAGE,
  SPELL_PICKER_SORT_LEVEL_ASC,
  SPELL_PICKER_SORT_NAME_ASC,
} from './spell-picker-drawer.types'

describe('spell-picker-drawer.lib', () => {
  it('omits the concentration marker when casting summary already includes concentration phrasing', () => {
    const compactSummary = buildSpellPickerCompactSummary(spellPickerDetectMagicFixture)

    expect(compactSummary.castingSummary).toContain('Concentration, up to 10 minutes')
    expect(collectSpellPickerMarkers(spellPickerDetectMagicFixture, compactSummary)).toEqual([
      'Ritual',
    ])
  })

  it('formats drawer title and selection summary metadata', () => {
    expect(formatSpellPickerDrawerTitle(SPELL_PICKER_MODE_CANTRIPS)).toBe('Add cantrip')
    expect(formatSpellPickerDrawerTitle(SPELL_PICKER_MODE_PREPARED_SPELLS)).toBe(
      'Add prepared spell',
    )
    expect(formatSpellPickerSelectionCountText(1, 3)).toBe('1 of 3 selected')
    expect(formatSpellPickerSelectionMetadata(SPELL_PICKER_MODE_CANTRIPS, 'Wizard')).toBe(
      'Wizard cantrips',
    )
    expect(formatSpellPickerSelectionMetadata(SPELL_PICKER_MODE_PREPARED_SPELLS, 'Wizard', 1)).toBe(
      'Wizard spells · 1st level',
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

  it('resets invalid sort modes after mode changes', () => {
    expect(
      resolveValidSpellPickerSort(SPELL_PICKER_MODE_CANTRIPS, false, SPELL_PICKER_SORT_LEVEL_ASC),
    ).toBe(SPELL_PICKER_SORT_NAME_ASC)
  })

  it('normalizes level chip selections to and from All', () => {
    expect(normalizeSpellPickerLevelSelection([1, 2], [1, 2])).toEqual([])
    expect(toggleSpellPickerLevelSelection([], SPELL_PICKER_LEVELS_ALL, [1, 2])).toEqual([])
    expect(toggleSpellPickerLevelSelection([], 1, [1, 2])).toEqual([1])
  })

  it('selects a specific level when All is active without snapping back to All', () => {
    expect(resolveSpellPickerLevelChipChange([], ['__all__', '1'], [1, 2])).toEqual([1])
    expect(resolveSpellPickerLevelChipChange([1], ['1', '__all__'], [1, 2])).toEqual([])
  })

  it('matches mechanics filters with OR within groups and AND across groups', () => {
    const spell = spellPickerDetectMagicFixture
    expect(
      matchesSpellPickerMechanicsFilters(spell, {
        castingTimes: ['action'],
        traits: ['ritual'],
        methods: [],
      }),
    ).toBe(true)
    expect(
      matchesSpellPickerMechanicsFilters(spell, {
        castingTimes: ['bonus-action'],
        traits: ['ritual'],
        methods: [],
      }),
    ).toBe(false)
  })

  it('derives casting-time filter labels from rules vocabulary', () => {
    expect(getSpellPickerCastingTimeFilterLabel('action')).toBe('Action')
    expect(getSpellPickerCastingTimeFilterLabel('bonus-action')).toBe('Bonus action')
    expect(getSpellPickerCastingTimeFilterLabel('1-minute')).toBe('1 minute')
    expect(getSpellPickerCastingTimeFilterLabel('10-minutes')).toBe('10 minutes')
  })

  it('appends prepared level suffix only for a single active level', () => {
    expect(resolveActivePreparedLevelSuffix(SPELL_PICKER_MODE_PREPARED_SPELLS, [1])).toBe(1)
    expect(
      resolveActivePreparedLevelSuffix(SPELL_PICKER_MODE_PREPARED_SPELLS, [1, 2]),
    ).toBeUndefined()
  })
})
