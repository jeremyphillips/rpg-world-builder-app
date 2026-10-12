import { SENSE_RANGES } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import {
  feetFromTelepathyRange,
  SENSE_RANGE_PLACEHOLDER,
  SENSE_RANGE_UNIT,
  senseRangeJoinedPairField,
  telepathyRangeAmountOptions,
  telepathyRangeFromFeet,
} from './content-sense-range-form-fields'

describe('content-sense-range-form-fields', () => {
  it('uses shared ten-foot steps and a feet unit select with no default range', () => {
    const field = senseRangeJoinedPairField()
    expect(field.start).toMatchObject({
      placeholder: SENSE_RANGE_PLACEHOLDER,
      options: SENSE_RANGES.map((range) => ({ value: range, label: String(range) })),
    })
    expect(field.start).not.toHaveProperty('defaultValue', 60)
    expect(field.end).toMatchObject({
      kind: 'select',
      options: [{ value: 'ft', label: 'ft.' }],
      defaultValue: SENSE_RANGE_UNIT,
    })
  })

  it('keeps mile amounts on telepathy and defaults an empty range to feet', () => {
    expect(telepathyRangeFromFeet(undefined)).toEqual({ amount: undefined, unit: 'ft' })
    expect(telepathyRangeAmountOptions('ft').map((option) => option.value)).toEqual([
      ...SENSE_RANGES,
    ])
    expect(telepathyRangeAmountOptions('mile')).toEqual([{ value: 1, label: '1' }])
    expect(feetFromTelepathyRange(1, 'mile')).toBe(5280)
    expect(telepathyRangeFromFeet(5280)).toEqual({ amount: 1, unit: 'mile' })
  })
})
