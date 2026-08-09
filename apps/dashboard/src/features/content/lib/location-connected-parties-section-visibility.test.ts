import { describe, expect, it } from 'vitest'

import { HARBORFORD } from '../locations/fixtures'
import {
  resolveLocationConnectedPartiesSectionEligibility,
  shouldShowLocationConnectedPartiesSection,
} from './location-connected-parties-section-visibility'

describe('location connected parties section visibility', () => {
  it('derives section eligibility from location profile', () => {
    expect(resolveLocationConnectedPartiesSectionEligibility(HARBORFORD)).toEqual({
      territorialAuthority: true,
      peopleAndOrganizations: true,
    })
  })

  it('shows empty sections to managers only', () => {
    const eligibility = resolveLocationConnectedPartiesSectionEligibility(HARBORFORD)

    expect(
      shouldShowLocationConnectedPartiesSection({
        section: 'peopleAndOrganizations',
        eligibility,
        canManage: true,
        rows: [],
        sectionGroup: 'people_and_organizations',
      }),
    ).toBe(true)

    expect(
      shouldShowLocationConnectedPartiesSection({
        section: 'peopleAndOrganizations',
        eligibility,
        canManage: false,
        rows: [],
        sectionGroup: 'people_and_organizations',
      }),
    ).toBe(false)
  })

  it('shows populated sections to read-only viewers', () => {
    const eligibility = resolveLocationConnectedPartiesSectionEligibility(HARBORFORD)

    expect(
      shouldShowLocationConnectedPartiesSection({
        section: 'territorialAuthority',
        eligibility,
        canManage: false,
        rows: [
          {
            relationshipId: 'rel-1',
            subjectType: 'organization',
            subject: { type: 'organization', id: 'org-1', name: 'Council', slug: 'council' },
            kind: 'governs',
            label: 'Governs',
            family: 'territorial_authority',
            priority: 50,
            sectionGroup: 'territorial_authority',
          },
        ],
        sectionGroup: 'territorial_authority',
      }),
    ).toBe(true)
  })
})
