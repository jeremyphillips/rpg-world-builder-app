import { describe, expect, it } from 'vitest'
import { createLocationInputSchema } from '@rpg/contracts'

import { DOCK_WARD, GREYSHORE, HARBORFORD, YAWNING_PORTAL } from '../fixtures'
import {
  canonicalFieldsForAuthoringType,
  resolveLocationAuthoringType,
} from './location-authoring-type'
import {
  buildLocationCreateInput,
  applyLocationFixedCreateContext,
  locationToFormValues,
} from './location-form-values'
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
    const values = locationToFormValues(HARBORFORD)

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
    const values = locationToFormValues(GREYSHORE) as LocationFormValues
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

describe('applyLocationFixedCreateContext', () => {
  it('overlays fixed authoringType and parent onto mutated form values', () => {
    const overlaid = applyLocationFixedCreateContext(
      {
        name: 'Harbor tavern',
        authoringType: 'district',
        parentLocationId: 'location-stale-parent',
      } as LocationFormValues,
      {
        authoringType: 'building',
        parent: { kind: 'fixed', locationId: DOCK_WARD.id },
      },
    )

    const input = buildLocationCreateInput(overlaid)

    expect(input).toMatchObject({
      kind: 'structure',
      structureType: 'building',
      parentLocationId: DOCK_WARD.id,
    })
    expect(input).not.toHaveProperty('authoringType')
  })

  it('does not overlay parent when overview fixed create leaves parent editable', () => {
    const overlaid = applyLocationFixedCreateContext(
      {
        name: 'Harbor tavern',
        authoringType: 'district',
        parentLocationId: 'location-chosen-parent',
      } as LocationFormValues,
      { authoringType: 'building' },
    )

    expect(overlaid.authoringType).toBe('building')
    expect(overlaid.parentLocationId).toBe('location-chosen-parent')
  })

  it('overlays fixed settlementType onto mutated form values', () => {
    const overlaid = applyLocationFixedCreateContext(
      {
        name: 'New town',
        authoringType: 'settlement',
        settlementType: 'hamlet',
      } as LocationFormValues,
      { authoringType: 'settlement', settlementType: 'city' },
    )

    expect(overlaid.settlementType).toBe('city')
  })
})
