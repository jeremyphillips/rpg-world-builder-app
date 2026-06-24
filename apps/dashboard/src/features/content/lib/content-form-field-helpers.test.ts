import { describe, expect, it } from 'vitest'

import { costFields } from './content-form-field-helpers'
import { EQUIPMENT_COST_VALUE_DIGITS } from './equipment-cost-config'

describe('costFields', () => {
  it('uses static valueDigits when equipment kind is known', () => {
    const [field] = costFields({ kind: 'weapon' })
    expect(field).toMatchObject({
      type: 'inputSelect',
      name: 'cost',
      valueKey: 'amount',
      unitKey: 'currency',
      valueDigits: 2,
    })
    expect(field).not.toHaveProperty('valueDigitsDependsOn')
  })

  it('resolves valueDigits dynamically from kind on the hub route', () => {
    const [field] = costFields()
    expect(field).toMatchObject({
      type: 'inputSelect',
      name: 'cost',
      valueDigitsDependsOn: 'kind',
      valueDigitsLookup: EQUIPMENT_COST_VALUE_DIGITS,
    })
    expect(field).not.toHaveProperty('valueDigits')
  })

  it('maps vehicle costs to five digit slots', () => {
    const [field] = costFields({ kind: 'vehicle' })
    expect(field).toMatchObject({ valueDigits: 5 })
  })
})
