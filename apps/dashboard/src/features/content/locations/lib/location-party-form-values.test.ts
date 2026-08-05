import { describe, expect, it } from 'vitest'

import { GREYSHORE, YAWNING_PORTAL } from '../fixtures'
import { buildLocationCreateInput, locationToFormValues } from './location-form-values'

describe('location form values without legacy relationship fields', () => {
  it('does not hydrate partyAssociations on edit', () => {
    const location = {
      ...YAWNING_PORTAL,
      partyAssociations: [
        {
          id: 'assoc-owner',
          kind: 'ownership' as const,
          party: { kind: 'organization' as const, organizationId: 'org-tavern' },
        },
      ],
    }

    expect('partyAssociations' in locationToFormValues(location)).toBe(false)
  })

  it('does not include party associations from the form layer on save', () => {
    const input = buildLocationCreateInput({
      name: YAWNING_PORTAL.name,
      authoringType: 'building',
      parentLocationId: YAWNING_PORTAL.parentLocationId,
      classification: { archetype: 'tavern' },
    })

    expect(input.partyAssociations).toEqual([])
  })

  it('still serializes region classification with empty territorial authority default', () => {
    const input = buildLocationCreateInput({
      name: GREYSHORE.name,
      authoringType: 'region',
      parentLocationId: GREYSHORE.parentLocationId,
      classification: {
        kind: 'geographic',
        type: 'coast',
      },
    })

    expect(input).toMatchObject({
      kind: 'region',
      classification: {
        kind: 'geographic',
        type: 'coast',
      },
      territorialAuthority: [],
    })
  })
})
