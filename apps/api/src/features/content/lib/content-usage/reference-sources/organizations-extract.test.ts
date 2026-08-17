import { describe, expect, it } from 'vitest'

import {
  LOCATION_ORGANIZATION_REFERENCE,
  ORGANIZATION_MEMBER_CLASS_AFFINITY_REFERENCE,
  ORGANIZATION_MEMBER_SPECIES_AFFINITY_REFERENCE,
} from '@rpg/contracts'

import {
  extractIdsFromOrganizationDescriptor,
  type OrganizationContentUsageHit,
} from './organizations-extract'

describe('organizations-extract', () => {
  const hit: OrganizationContentUsageHit = {
    _id: 'org-1',
    name: 'Lantern Guild',
    slug: 'lantern-guild',
    memberClassAffinityIds: ['class-rogue', 'class-fighter'],
    memberSpeciesAffinityIds: ['species-dwarf', 'species-elf'],
    connections: {
      locations: [{ locationId: 'loc-1' }, { locationId: 'loc-2' }],
    },
  }

  it('extracts location connection ids', () => {
    expect(extractIdsFromOrganizationDescriptor(hit, LOCATION_ORGANIZATION_REFERENCE.path)).toEqual(
      ['loc-1', 'loc-2'],
    )
  })

  it('extracts member class affinity ids', () => {
    expect(
      extractIdsFromOrganizationDescriptor(hit, ORGANIZATION_MEMBER_CLASS_AFFINITY_REFERENCE.path),
    ).toEqual(['class-rogue', 'class-fighter'])
  })

  it('extracts member species affinity ids', () => {
    expect(
      extractIdsFromOrganizationDescriptor(
        hit,
        ORGANIZATION_MEMBER_SPECIES_AFFINITY_REFERENCE.path,
      ),
    ).toEqual(['species-dwarf', 'species-elf'])
  })

  it('drops empty member class affinity ids', () => {
    expect(
      extractIdsFromOrganizationDescriptor(
        { ...hit, memberClassAffinityIds: ['class-rogue', '', undefined as unknown as string] },
        ORGANIZATION_MEMBER_CLASS_AFFINITY_REFERENCE.path,
      ),
    ).toEqual(['class-rogue'])
  })
})
