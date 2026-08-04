import { describe, expect, it } from 'vitest'

import { GREYSHORE, YAWNING_PORTAL } from '../fixtures'
import { buildLocationCreateInput, locationToFormValues } from './location-form-values'

describe('locationToFormValues party associations', () => {
  it('hydrates partyAssociations on edit', () => {
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

    expect(locationToFormValues(location).partyAssociations).toEqual(location.partyAssociations)
  })

  it('preserves associations not currently available for authoring through save', () => {
    const location = {
      ...GREYSHORE,
      partyAssociations: [
        {
          id: 'assoc-owner',
          kind: 'ownership' as const,
          party: { kind: 'organization' as const, organizationId: 'org-realm' },
        },
      ],
    }

    const formValues = locationToFormValues(location)
    expect(formValues.partyAssociations).toEqual(location.partyAssociations)

    const input = buildLocationCreateInput({
      name: location.name,
      authoringType: 'region',
      parentLocationId: location.parentLocationId,
      classification: formValues.classification,
      partyAssociations: location.partyAssociations,
    })

    expect(input.partyAssociations).toEqual(location.partyAssociations)
  })
})
