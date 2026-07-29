import { describe, expect, it } from 'vitest'

import {
  buildOrganizationPickerTypeOptions,
  filterAndSortOrganizationPickerItems,
  formatOrganizationPickerDescription,
  getOrganizationPickerSearchText,
} from './organization-picker-drawer.lib'
import { organizationPickerItems } from './organization-picker-drawer.fixtures'

describe('organization picker library', () => {
  it('searches names and user-facing type labels', () => {
    expect(getOrganizationPickerSearchText(organizationPickerItems[0]!.organization)).toContain(
      'Guild or professional',
    )
    expect(
      filterAndSortOrganizationPickerItems(organizationPickerItems, {
        searchQuery: 'government',
        type: 'all',
      }).map(({ organization }) => organization.name),
    ).toEqual(['City Council'])
  })

  it('filters by type and sorts by name', () => {
    expect(
      filterAndSortOrganizationPickerItems(organizationPickerItems, {
        searchQuery: '',
        type: 'professional',
      }).map(({ organization }) => organization.name),
    ).toEqual(['Lantern Guild'])
  })

  it('builds only available type options and formats the selected summary', () => {
    expect(
      buildOrganizationPickerTypeOptions(
        organizationPickerItems.map(({ organization }) => organization),
      ),
    ).toEqual([
      { value: 'all', label: 'All types' },
      { value: 'government', label: 'Government' },
      { value: 'professional', label: 'Guild or professional' },
      { value: 'academic', label: 'Academic' },
    ])
    expect(formatOrganizationPickerDescription(0)).toContain('Choose any')
    expect(formatOrganizationPickerDescription(2)).toBe('2 organizations selected.')
  })
})
