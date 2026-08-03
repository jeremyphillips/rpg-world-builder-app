import { describe, expect, expectTypeOf, it } from 'vitest'
import { createLocationInputSchema, type CreateLocationInput } from '@rpg/contracts'

import { WATERDEEP } from '../fixtures'
import { locationFormDef } from './location-form-def'
import type { LocationFormValues } from './location-form-fields'

it('type: toInput return type matches CreateLocationInput', () => {
  expectTypeOf(locationFormDef.toInput).returns.toEqualTypeOf<CreateLocationInput>()
})

describe('locationFormDef', () => {
  it('round-trips location fields into a publish input', () => {
    const values = locationFormDef.toFormValues(WATERDEEP) as LocationFormValues
    const input = locationFormDef.toInput(values)
    expect(() => createLocationInputSchema.parse(input)).not.toThrow()
    expect(input.kind).toBe('settlement')
    if (input.kind === 'settlement') {
      expect(input.settlementType).toBe('city')
    }
    expect(input.parentLocationId).toBe(WATERDEEP.parentLocationId)
  })

  it('allows incomplete drafts without parent or subtype fields', () => {
    const input = locationFormDef.toInput(
      { name: 'Unfinished Site', kind: 'site' } as LocationFormValues,
      undefined,
      'draft',
    )
    expect(input.kind).toBe('site')
    expect(input).not.toHaveProperty('parentLocationId')
    expect(input).not.toHaveProperty('siteType')
  })

  it('requires kind for publish', () => {
    expect(() => locationFormDef.toInput({ name: 'Incomplete' } as LocationFormValues)).toThrow()
  })
})
