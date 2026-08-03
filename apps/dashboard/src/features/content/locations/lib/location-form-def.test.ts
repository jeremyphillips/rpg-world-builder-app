import { describe, expect, expectTypeOf, it } from 'vitest'
import { createLocationInputSchema, type CreateLocationInput } from '@rpg/contracts'

import { WATERDEEP, YAWNING_PORTAL } from '../fixtures'
import { resolveLocationAuthoringType } from './location-authoring-type'
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
    expect(values.authoringType).toBe('settlement')
  })

  it('round-trips building classification into a publish input', () => {
    const values = locationFormDef.toFormValues(YAWNING_PORTAL) as LocationFormValues
    const input = locationFormDef.toInput(values)
    expect(() => createLocationInputSchema.parse(input)).not.toThrow()
    expect(input.kind).toBe('structure')
    if (input.kind === 'structure') {
      expect(input.structureType).toBe('building')
      expect(input.classification).toEqual({ archetype: 'tavern' })
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
      classification: { archetype: 'inn' },
    } as LocationFormValues)

    expect(input).toMatchObject({
      kind: 'structure',
      structureType: 'building',
      classification: { archetype: 'inn' },
    })
    expect(locationFormDef.toFormValues(YAWNING_PORTAL)).toMatchObject({
      authoringType: 'building',
      classification: { archetype: 'tavern' },
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
