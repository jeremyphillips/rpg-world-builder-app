import { describe, expect, it } from 'vitest'

import {
  SAVING_THROW_ABILITY_HINT,
  SAVING_THROW_ABILITY_LABEL,
  SAVING_THROW_DC_SOURCE_LABEL,
  SAVING_THROW_SECTION_LEGEND,
} from './saving-throw-field-copy'
import { savingThrowFieldGroup } from './saving-throw-field-group'

describe('saving-throw-field-copy', () => {
  it('matches the optional saving-throw field group chrome', () => {
    const group = savingThrowFieldGroup({ renderCastingAbility: () => null })
    expect(group.heading?.label).toBe(SAVING_THROW_SECTION_LEGEND)
    const row = group.fields?.find((field) => field.kind === 'row')
    const rowFields = row && 'fields' in row ? row.fields : []
    const ability = rowFields.find(
      (field) => 'name' in field && field.name === 'savingThrow.ability',
    ) as { label?: string; hint?: string; required?: boolean } | undefined
    expect(ability?.label).toBe(SAVING_THROW_ABILITY_LABEL)
    expect(ability?.hint).toBe(SAVING_THROW_ABILITY_HINT)
    expect(ability?.required).toBe(true)
    const dcSource = rowFields.find(
      (field) => 'name' in field && field.name === 'savingThrow.dcSource.kind',
    ) as { label?: string; required?: boolean } | undefined
    expect(dcSource?.label).toBe(SAVING_THROW_DC_SOURCE_LABEL)
    expect(dcSource?.required).toBe(true)
  })
})
