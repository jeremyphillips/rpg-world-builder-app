import { describe, expect, it } from 'vitest'

import { makeOrganization } from '@/test/fixtures/factories/organization'

import { organizationPickerItems } from './organization-picker-drawer.fixtures'
import {
  formatOrganizationPickerDescription,
  getOrganizationPickerSearchText,
  scoreAndSortOrganizationPickerItems,
} from './organization-picker-drawer.lib'

function legacyIncludes(text: string, query: string): boolean {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true
  return text.trim().toLowerCase().includes(normalized)
}

describe('organization picker library', () => {
  it('searches names and canonical classification terms', () => {
    expect(getOrganizationPickerSearchText(organizationPickerItems[0]!.organization)).toContain(
      'Occupational',
    )
    expect(
      scoreAndSortOrganizationPickerItems(organizationPickerItems, {
        searchQuery: 'government',
      }).map(({ organization }) => organization.name),
    ).toEqual(['City Council'])
  })

  it('keeps empty-query order by name', () => {
    expect(
      scoreAndSortOrganizationPickerItems([...organizationPickerItems].reverse(), {
        searchQuery: '   ',
      }).map(({ organization }) => organization.name),
    ).toEqual(['City Council', 'Lantern Guild', 'Silver Circle'])
  })

  it('keeps every legacy includes match', () => {
    const queries = [
      '',
      '  Government  ',
      'GOVERNMENT',
      'lantern occupational',
      'city council',
      "o'brien",
    ]
    const named = makeOrganization({
      id: 'organization-obrien',
      slug: 'obrien-watch',
      name: "O'Brien's Watch",
      organizationDomain: 'government',
    })
    const items = [...organizationPickerItems, { organization: named, selected: false }]

    for (const item of items) {
      const text = getOrganizationPickerSearchText(item.organization)
      for (const query of queries) {
        if (!legacyIncludes(text, query)) continue
        expect(
          scoreAndSortOrganizationPickerItems(items, { searchQuery: query }).some(
            (row) => row.organization.id === item.organization.id,
          ),
          `${item.organization.name} / ${JSON.stringify(query)}`,
        ).toBe(true)
      }
    }
  })

  it('ranks a literal name hit above a discovery-term hit', () => {
    const nameHit = makeOrganization({
      id: 'organization-government-hall',
      slug: 'government-hall',
      name: 'Government Hall',
      organizationDomain: 'occupational',
    })
    const keywordHit = organizationPickerItems[1]!

    expect(
      scoreAndSortOrganizationPickerItems(
        [keywordHit, { organization: nameHit, selected: false }],
        { searchQuery: 'government' },
      ).map(({ organization }) => organization.name),
    ).toEqual(['Government Hall', 'City Council'])
  })

  it('formats the singular description', () => {
    expect(formatOrganizationPickerDescription()).toBe(
      'Choose an organization connected to this character.',
    )
  })

  it('breaks equal names and equal search scores on stable id', () => {
    const amberB = makeOrganization({
      id: 'organization-b',
      slug: 'amber-b',
      name: 'Amber Hall',
      organizationDomain: 'government',
    })
    const amberA = makeOrganization({
      id: 'organization-a',
      slug: 'amber-a',
      name: 'Amber Hall',
      organizationDomain: 'government',
    })
    const zeta = makeOrganization({
      id: 'organization-z',
      slug: 'zeta-guild',
      name: 'Zeta Guild',
      organizationDomain: 'government',
    })
    const items = [zeta, amberB, amberA].map((organization) => ({
      organization,
      selected: false,
    }))

    expect(
      scoreAndSortOrganizationPickerItems(items, { searchQuery: '' }).map(
        ({ organization }) => organization.id,
      ),
    ).toEqual(['organization-a', 'organization-b', 'organization-z'])
    expect(
      scoreAndSortOrganizationPickerItems(items, { searchQuery: 'amber' }).map(
        ({ organization }) => organization.id,
      ),
    ).toEqual(['organization-a', 'organization-b'])
    expect(items.map(({ organization }) => organization.id)).toEqual([
      'organization-z',
      'organization-b',
      'organization-a',
    ])
  })
})
