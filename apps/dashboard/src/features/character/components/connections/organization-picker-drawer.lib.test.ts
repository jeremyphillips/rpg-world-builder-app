import { describe, expect, it } from 'vitest'

import {
  buildOrganizationPickerDomainOptions,
  filterAndSortOrganizationPickerItems,
  formatOrganizationPickerDescription,
  getOrganizationPickerSearchText,
} from './organization-picker-drawer.lib'
import { organizationPickerItems } from './organization-picker-drawer.fixtures'

describe('organization picker library', () => {
  it('searches names and canonical classification terms', () => {
    expect(getOrganizationPickerSearchText(organizationPickerItems[0]!.organization)).toContain(
      'Occupational',
    )
    expect(
      filterAndSortOrganizationPickerItems(organizationPickerItems, {
        searchQuery: 'government',
        domain: 'all',
      }).map(({ organization }) => organization.name),
    ).toEqual(['City Council'])
  })

  it('filters by domain and sorts by name', () => {
    expect(
      filterAndSortOrganizationPickerItems(organizationPickerItems, {
        searchQuery: '',
        domain: 'occupational',
      }).map(({ organization }) => organization.name),
    ).toEqual(['Lantern Guild'])
  })

  it('builds only available domain options and formats the singular description', () => {
    expect(
      buildOrganizationPickerDomainOptions(
        organizationPickerItems.map(({ organization }) => organization),
      ),
    ).toEqual([
      { value: 'all', label: 'All domains' },
      { value: 'government', label: 'Government' },
      { value: 'occupational', label: 'Occupational' },
      { value: 'academic', label: 'Academic' },
    ])
    expect(formatOrganizationPickerDescription()).toBe(
      'Choose an organization connected to this character.',
    )
  })
})
