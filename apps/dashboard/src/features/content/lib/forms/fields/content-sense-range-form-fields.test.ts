import { describe, expect, it } from 'vitest'

import {
  monsterSenseRangeInputUnitProps,
  SENSE_RANGE_PLACEHOLDER,
  senseRangeJoinedPairField,
} from './content-sense-range-form-fields'

describe('content-sense-range-form-fields', () => {
  it('uses an em dash placeholder and no default range in grant joined pair', () => {
    expect(senseRangeJoinedPairField().start).toMatchObject({
      placeholder: SENSE_RANGE_PLACEHOLDER,
    })
    expect(senseRangeJoinedPairField().start).not.toHaveProperty('defaultValue', '60')
  })

  it('builds monster sense InputUnitField props without implicit defaults', () => {
    expect(monsterSenseRangeInputUnitProps({ id: 'darkvision-range', label: 'Range' })).toEqual({
      id: 'darkvision-range',
      label: 'Range',
      inputType: 'number',
      unit: 'ft.',
      min: 0,
      valueDigits: 3,
      placeholder: SENSE_RANGE_PLACEHOLDER,
      width: 'auto',
    })
  })
})
