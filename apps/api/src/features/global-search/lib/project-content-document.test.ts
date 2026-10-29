import { describe, expect, it } from 'vitest'

import { getEquipmentBySlug } from '@rpg/catalog/equipment'
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

  it('indexes functions and practices independently of the single primary domain', () => {
    const document = projectContentEntity('organizations', {
      id: 'organization-night-market',
      name: 'Night Market Caucus',
      slug: 'night-market-caucus',
      source: 'homebrew',
      status: 'published',
      organizationDomain: 'political',
      organizationForm: 'network',
      practices: ['smuggling'],
    } as never)

    expect(document.secondary).toBe('Political')
    expect(document.fields.some((field) => field.text.includes('Smuggling'))).toBe(true)
    expect(document.fields.some((field) => field.text.includes('contraband'))).toBe(true)
  })

  it('projects plate Armor Class from the campaign rules', () => {
    const plate = getEquipmentBySlug('srd-cc-5.2.1', 'plate-armor')

    expect(() => projectContentEntity('equipment', plate)).toThrow(/Armor Class rules are required/)

    const ascendingTen = projectContentEntity('equipment', plate, {
      armorClassRules: { mode: 'ascending', base: 10 },
    })
    const ascendingNine = projectContentEntity('equipment', plate, {
      armorClassRules: { mode: 'ascending', base: 9 },
    })

    expect(ascendingTen.secondary).toContain('18')
    expect(ascendingNine.secondary).toContain('17')
  })
})
