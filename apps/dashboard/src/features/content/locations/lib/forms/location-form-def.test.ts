import { describe, expect, expectTypeOf, it } from 'vitest'
import { createLocationInputSchema, type CreateLocationInput } from '@rpg/contracts'

import { HARBORFORD, YAWNING_PORTAL } from '../../fixtures'
import { resolveLocationAuthoringType } from '../location-authoring-type'
import { locationFormDef } from './location-form-def'
import type { LocationFormValues } from './location-form-fields'

it('type: toInput return type matches CreateLocationInput', () => {
  expectTypeOf(locationFormDef.toInput).returns.toEqualTypeOf<CreateLocationInput>()
})

describe('locationFormDef', () => {
  it('round-trips location fields into a publish input', () => {
    const values = locationFormDef.toFormValues(HARBORFORD) as LocationFormValues
    const input = locationFormDef.toInput(values)
    expect(() => createLocationInputSchema.parse(input)).not.toThrow()
    expect(input.kind).toBe('settlement')
    if (input.kind === 'settlement') {
      expect(input.settlementType).toBe('city')
    }
    expect(input.parentLocationId).toBe(HARBORFORD.parentLocationId)
    expect(values.authoringType).toBe('settlement')
  })

  it('round-trips building classification into a publish input', () => {
    const values = locationFormDef.toFormValues(YAWNING_PORTAL) as LocationFormValues
    const input = locationFormDef.toInput(values)
    expect(() => createLocationInputSchema.parse(input)).not.toThrow()
    expect(input.kind).toBe('structure')
    if (input.kind === 'structure') {
      expect(input.structureType).toBe('building')
      expect(input.classification).toEqual({ facilityType: 'brewery' })
    }
    expect(values.authoringType).toBe('building')
    expect(resolveLocationAuthoringType(YAWNING_PORTAL)).toBe('building')
    expect(input).not.toHaveProperty('authoringType')
  })

  it('serializes authoringType building to canonical structure fields', () => {
    const input = locationFormDef.toInput({
      name: 'The Sleeping Giant',
      authoringType: 'building',
      parentLocationId: YAWNING_PORTAL.parentLocationId,
      classification: { form: 'house' },
    } as LocationFormValues)

    expect(input).toMatchObject({
      kind: 'structure',
      structureType: 'building',
      classification: { form: 'house' },
    })
    expect(locationFormDef.toFormValues(YAWNING_PORTAL)).toMatchObject({
      authoringType: 'building',
      classification: { facilityType: 'brewery' },
    })
  })

  it('allows incomplete drafts without parent or subtype fields', () => {
    const input = locationFormDef.toInput(
      { name: 'Unfinished Site', authoringType: 'site' } as LocationFormValues,
      undefined,
      'draft',
    )
    expect(input.kind).toBe('site')
    expect(input).not.toHaveProperty('parentLocationId')
    expect(input).not.toHaveProperty('siteType')
  })

  it('requires authoringType for publish', () => {
    expect(() => locationFormDef.toInput({ name: 'Incomplete' } as LocationFormValues)).toThrow()
  })
})
