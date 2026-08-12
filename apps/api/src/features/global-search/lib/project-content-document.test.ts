import { describe, expect, it } from 'vitest'

import { buildingClassificationSchema, DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'

import { projectContentEntity } from './project-content-document'

describe('projectContentEntity', () => {
  it('sets campaignAvailable false when catalog access is unavailable', () => {
    const document = projectContentEntity('feats', {
      id: 'feat-1',
      name: 'Hidden Feat',
      slug: 'hidden-feat',
      source: 'homebrew',
      status: 'published',
      campaignAccess: {
        ...DEFAULT_CONTENT_CAMPAIGN_ACCESS,
        available: false,
        effectiveAudience: 'none',
      },
    } as never)

    expect(document.campaignAvailable).toBe(false)
  })

  it('omits campaignAvailable when catalog access is available', () => {
    const document = projectContentEntity('feats', {
      id: 'feat-2',
      name: 'Visible Feat',
      slug: 'visible-feat',
      source: 'homebrew',
      status: 'published',
      campaignAccess: DEFAULT_CONTENT_CAMPAIGN_ACCESS,
    } as never)

    expect(document.campaignAvailable).toBeUndefined()
  })

  it('uses the location display summary for location secondary lines', () => {
    const document = projectContentEntity('locations', {
      id: 'location-tavern',
      name: 'Yawning Portal',
      slug: 'yawning-portal',
      source: 'homebrew',
      status: 'published',
      kind: 'structure',
      structureType: 'building',
      classification: buildingClassificationSchema.parse({ facilityType: 'brewery' }),
      campaignAccess: DEFAULT_CONTENT_CAMPAIGN_ACCESS,
    } as never)

    expect(document.secondary).toBe('Building · Brewery')
  })

  it('indexes activities independently of the single primary domain', () => {
    const document = projectContentEntity('organizations', {
      id: 'organization-night-market',
      name: 'Night Market Caucus',
      slug: 'night-market-caucus',
      source: 'homebrew',
      status: 'published',
      organizationDomain: 'political',
      organizationForm: 'network',
      activities: ['smuggling'],
    } as never)

    expect(document.secondary).toBe('Political')
    expect(document.fields.some((field) => field.text.includes('Smuggling'))).toBe(true)
    expect(document.fields.some((field) => field.text.includes('contraband'))).toBe(true)
  })
})
