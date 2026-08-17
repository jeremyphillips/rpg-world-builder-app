import { describe, expect, it } from 'vitest'

import { CITY_COUNCIL, CRAFT_GUILD } from '../fixtures'
import {
  buildOrganizationDetailViewModel,
  formatLocationConnectionsCount,
  ORGANIZATION_EMPTY_SECTION_TEXT,
  type OrganizationLocationConnectionsViewModel,
} from './organization-display'

const emptyLocationConnections: OrganizationLocationConnectionsViewModel = {
  previewItems: [],
  total: 0,
  emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.locationConnections,
}

describe('formatLocationConnectionsCount', () => {
  it('pluralizes location connection count copy', () => {
    expect(formatLocationConnectionsCount(1)).toBe('1 location connection')
    expect(formatLocationConnectionsCount(4)).toBe('4 location connections')
  })
})

describe('buildOrganizationDetailViewModel', () => {
  it('maps canonical classification, authored description, and location connections', () => {
    expect(buildOrganizationDetailViewModel(CITY_COUNCIL, emptyLocationConnections)).toEqual({
      statRows: [
        {
          label: 'Domain',
          value: 'Government',
          info: 'Exercises public governing, administrative, legislative, or judicial authority.',
          infoAriaLabel: 'About Government',
        },
      ],
      description: '<p>The elected council governing the city.</p>',
      locationConnections: emptyLocationConnections,
    })
  })

  it('shows separate Functions and Practices stat rows and omits empty axes', () => {
    expect(buildOrganizationDetailViewModel(CRAFT_GUILD, emptyLocationConnections)).toEqual({
      statRows: [
        {
          label: 'Domain',
          value: 'Occupational',
          info: 'Serves, regulates, represents, or develops a trade or professional community.',
          infoAriaLabel: 'About Occupational',
        },
        {
          label: 'Form',
          value: 'Guild',
          info: 'A membership body organized to govern or support a shared practice or trade.',
          infoAriaLabel: 'About Guild',
        },
        {
          label: 'Functions',
          value: 'Standards · Training',
        },
        {
          label: 'Practices',
          value: 'Apprenticeship · Blacksmithing',
        },
      ],
      description: '<p>A craft guild regulating smithing standards and apprentices.</p>',
      locationConnections: emptyLocationConnections,
    })
  })

  it('shows member class affinity labels when present', () => {
    const organization = {
      ...CRAFT_GUILD,
      memberClassAffinityIds: ['class-fighter', 'class-rogue', 'class-missing'],
    }
    const classLabelById = new Map([
      ['class-fighter', 'Fighter'],
      ['class-rogue', 'Rogue'],
    ])

    expect(
      buildOrganizationDetailViewModel(organization, emptyLocationConnections, classLabelById),
    ).toMatchObject({
      statRows: expect.arrayContaining([
        {
          label: 'Member class affinities',
          value: 'Fighter · Rogue · Class Missing · Unresolved reference',
        },
      ]),
    })
  })
})
