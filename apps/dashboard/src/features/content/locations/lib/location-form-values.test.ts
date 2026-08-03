import { describe, expect, it } from 'vitest'
import { createLocationInputSchema } from '@rpg/contracts'

import { DOCK_WARD, SWORD_COAST, WATERDEEP, YAWNING_PORTAL } from '../fixtures'
import {
  canonicalFieldsForAuthoringType,
  resolveLocationAuthoringType,
} from './location-authoring-type'
import { buildLocationCreateInput, locationToFormValues } from './location-form-values'
import type { LocationFormValues } from './location-form-fields'

describe('locationToFormValues', () => {
  it('hydrates authoringType and omits canonical kind and structureType', () => {
    const values = locationToFormValues(YAWNING_PORTAL)

    expect(values.authoringType).toBe('building')
    expect(values).not.toHaveProperty('kind')
    expect(values).not.toHaveProperty('structureType')
    expect(values.classification).toEqual({ archetype: 'tavern' })
  })

  it('hydrates settlement subtype fields through authoringType', () => {
    const values = locationToFormValues(WATERDEEP)

    expect(values.authoringType).toBe('settlement')
    expect(values.settlementType).toBe('city')
  })
})

describe('buildLocationCreateInput', () => {
  it('maps authoringType building to canonical structure fields', () => {
    const input = buildLocationCreateInput({
      name: 'The Sleeping Giant',
      authoringType: 'building',
      parentLocationId: DOCK_WARD.id,
      classification: { archetype: 'inn' },
    } as LocationFormValues)

    expect(() => createLocationInputSchema.parse(input)).not.toThrow()
    expect(input).toMatchObject({
      kind: 'structure',
      structureType: 'building',
      classification: { archetype: 'inn' },
      parentLocationId: DOCK_WARD.id,
    })
    expect(input).not.toHaveProperty('authoringType')
  })

  it('round-trips building authoringType through hydrate and serialize', () => {
    const values = locationToFormValues(YAWNING_PORTAL) as LocationFormValues
    const input = buildLocationCreateInput(values)

    expect(values.authoringType).toBe('building')
    expect(resolveLocationAuthoringType(YAWNING_PORTAL)).toBe('building')
    expect(canonicalFieldsForAuthoringType('building')).toEqual({
      kind: 'structure',
      structureType: 'building',
    })
    expect(input).toMatchObject({
      kind: 'structure',
      structureType: 'building',
      classification: { archetype: 'tavern' },
    })
  })

  it('maps region authoringType to canonical region classification', () => {
    const values = locationToFormValues(SWORD_COAST) as LocationFormValues
    const input = buildLocationCreateInput(values)

    expect(values.authoringType).toBe('region')
    expect(input).toMatchObject({
      kind: 'region',
      classification: { kind: 'geographic', type: 'coast' },
    })
  })

  it('omits kind on draft input when authoringType is unset', () => {
    const input = buildLocationCreateInput(
      { name: 'Draft location' } as LocationFormValues,
      undefined,
      'draft',
    )

    expect(input).not.toHaveProperty('kind')
    expect(input).not.toHaveProperty('authoringType')
  })
})
