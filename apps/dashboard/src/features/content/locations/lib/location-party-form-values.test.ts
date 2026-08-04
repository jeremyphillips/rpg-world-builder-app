import { describe, expect, it } from 'vitest'

import { YAWNING_PORTAL } from '../fixtures'
import { locationToFormValues } from './location-form-values'

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
})
