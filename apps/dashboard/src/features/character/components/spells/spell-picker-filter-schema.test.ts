import type { SpellPickerItem } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { sanitizeFilterState } from '@rpg/ui/filters'

import {
  createSpellPickerFilterSchema,
  type SpellPickerFilterState,
} from './spell-picker-filter-schema'
import {
  SPELL_PICKER_MODE_CANTRIPS,
  SPELL_PICKER_MODE_PREPARED_SPELLS,
  SPELL_PICKER_SCHOOL_ALL,
  type SpellPickerCastingTimeFilter,
  type SpellPickerMethodFilter,
} from './spell-picker-drawer.types'

const preparedItems = [] as unknown as readonly SpellPickerItem[]

describe('spell-picker-filter-schema', () => {
  it('keeps valid state unchanged when schema shape is stable', () => {
    const schema = createSpellPickerFilterSchema({
      mode: SPELL_PICKER_MODE_PREPARED_SPELLS,
      items: preparedItems,
      showLevelChips: true,
      showSchoolFilter: true,
      levelOptions: [1, 3],
      castingTimeOptions: [],
      traitOptions: [],
      methodOptions: [],
    })

    const state: SpellPickerFilterState = {
      selectedLevels: [3],
      selectedSchool: 'evocation',
      mechanicsFilters: { castingTimes: [], traits: [], methods: [] },
    }

    expect(sanitizeFilterState(schema, state)).toBe(state)
  })

  it('drops level selections in cantrip mode and prunes invalid mechanics values', () => {
    const schema = createSpellPickerFilterSchema({
      mode: SPELL_PICKER_MODE_CANTRIPS,
      items: preparedItems,
      showLevelChips: false,
      showSchoolFilter: false,
      levelOptions: [],
      castingTimeOptions: ['action'],
      traitOptions: ['concentration'],
      methodOptions: ['ranged-spell-attack'],
    })

    const state: SpellPickerFilterState = {
      selectedLevels: [3],
      mechanicsFilters: {
        castingTimes: ['action', 'bonus_action' as SpellPickerCastingTimeFilter],
        traits: ['concentration'],
        methods: ['somatic' as SpellPickerMethodFilter],
      },
    }

    expect(sanitizeFilterState(schema, state)).toEqual({
      selectedLevels: [],
      mechanicsFilters: {
        castingTimes: ['action'],
        traits: ['concentration'],
        methods: [],
      },
    })
  })

  it('treats school sentinel values as non-constraining', () => {
    const schema = createSpellPickerFilterSchema({
      mode: SPELL_PICKER_MODE_PREPARED_SPELLS,
      items: preparedItems,
      showLevelChips: false,
      showSchoolFilter: true,
      levelOptions: [],
      castingTimeOptions: [],
      traitOptions: [],
      methodOptions: [],
    })

    const schoolField = schema.fields.find((field) => field.id === 'selectedSchool')
    expect(schoolField?.isValueConstraining?.(SPELL_PICKER_SCHOOL_ALL)).toBe(false)
  })
})
