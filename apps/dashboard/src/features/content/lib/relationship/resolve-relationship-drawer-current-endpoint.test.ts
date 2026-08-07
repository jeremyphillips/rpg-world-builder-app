import { describe, expect, it } from 'vitest'

import { resolveLocationInverseCurrentOrganizationEndpoint } from './resolve-relationship-drawer-current-endpoint'
import { ENTITY_REPLACEMENT_UNAVAILABLE_ORGANIZATION_HEADING } from '../entity-replacement/entity-replacement-current-entity'

describe('resolveLocationInverseCurrentOrganizationEndpoint', () => {
  it('returns hydrated organization snapshot from connected party row', () => {
    expect(
      resolveLocationInverseCurrentOrganizationEndpoint({
        relationshipId: 'rel-1',
        rows: [
          {
            relationshipId: 'rel-1',
            subject: {
              id: 'org-1',
              name: 'City Council',
              slug: 'city-council',
              type: 'organization',
            },
            kind: 'governs',
            label: 'Governs',
            family: 'territorial_authority',
            priority: 1,
            sectionGroup: 'territorial_authority',
          },
        ],
        organizations: [
          {
            id: 'org-1',
            organizationKind: 'government',
            imageKey: 'img-1',
          },
        ],
      }),
    ).toEqual({
      heading: 'City Council',
      subheading: 'Government',
      imageKey: 'img-1',
      unavailable: false,
    })
  })

  it('returns unavailable snapshot when row subject cannot be resolved', () => {
    expect(
      resolveLocationInverseCurrentOrganizationEndpoint({
        relationshipId: 'missing',
        rows: [],
      }),
    ).toEqual({
      heading: ENTITY_REPLACEMENT_UNAVAILABLE_ORGANIZATION_HEADING,
      unavailable: true,
    })
  })
})
