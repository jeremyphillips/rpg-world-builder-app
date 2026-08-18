import { describe, expect, it } from 'vitest'
import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'

import { makeCharacterClass } from '@/test/fixtures/factories/character-class'
import { makeSpecies } from '@/test/fixtures/factories/species'
import { CAMPAIGN_ACCESS_TABLE_UNAVAILABLE_LABEL } from '../../lib/campaign-access/campaign-access-table-labels'
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
      members: {
        ...CRAFT_GUILD.members,
        classAffinityIds: ['class-fighter', 'class-rogue', 'class-missing'],
      },
    }
    const catalogClasses = [
      makeCharacterClass({ id: 'class-fighter', slug: 'fighter', name: 'Fighter' }),
      makeCharacterClass({ id: 'class-rogue', slug: 'rogue', name: 'Rogue' }),
    ]

    expect(
      buildOrganizationDetailViewModel(organization, emptyLocationConnections, catalogClasses),
    ).toMatchObject({
      statRows: expect.arrayContaining([
        {
          label: 'Member class affinities',
          value: 'Fighter · Rogue · Class Missing · Unresolved reference',
        },
      ]),
    })
  })

  it('marks unavailable stored affinity classes on the detail stat row', () => {
    const organization = {
      ...CRAFT_GUILD,
      members: {
        ...CRAFT_GUILD.members,
        classAffinityIds: ['class-wizard'],
      },
    }
    const catalogClasses = [
      makeCharacterClass({ id: 'class-fighter', slug: 'fighter', name: 'Fighter' }),
      {
        ...makeCharacterClass({ id: 'class-wizard', slug: 'wizard', name: 'Wizard' }),
        campaignAccess: { ...DEFAULT_CONTENT_CAMPAIGN_ACCESS, available: false },
      },
    ]

    expect(
      buildOrganizationDetailViewModel(organization, emptyLocationConnections, catalogClasses),
    ).toMatchObject({
      statRows: expect.arrayContaining([
        {
          label: 'Member class affinities',
          value: `Wizard · ${CAMPAIGN_ACCESS_TABLE_UNAVAILABLE_LABEL}`,
        },
      ]),
    })
  })

  it('shows member species affinity labels when present', () => {
    const organization = {
      ...CRAFT_GUILD,
      members: {
        ...CRAFT_GUILD.members,
        speciesAffinityIds: ['species-dwarf', 'species-elf', 'species-missing'],
      },
    }
    const catalogSpecies = [
      makeSpecies({ id: 'species-dwarf', slug: 'dwarf', name: 'Dwarf' }),
      makeSpecies({ id: 'species-elf', slug: 'elf', name: 'Elf' }),
    ]

    expect(
      buildOrganizationDetailViewModel(organization, emptyLocationConnections, [], catalogSpecies),
    ).toMatchObject({
      statRows: expect.arrayContaining([
        {
          label: 'Member species affinities',
          value: 'Dwarf · Elf · Species Missing · Unresolved reference',
        },
      ]),
    })
  })
})
