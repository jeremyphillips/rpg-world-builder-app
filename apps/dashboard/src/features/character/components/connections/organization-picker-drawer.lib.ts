import { getOrganizationKindLabel, ORGANIZATION_KIND_IDS, type Organization } from '@rpg/contracts'
import { normalizeSearchQuery } from '@rpg/ui'

import {
  ORGANIZATION_PICKER_ALL_TYPES,
  type OrganizationPickerItem,
  type OrganizationPickerTypeFilter,
} from './organization-picker-drawer.types'

const organizationNameCollator = new Intl.Collator(undefined, {
  sensitivity: 'base',
  numeric: true,
})

export const ORGANIZATION_PICKER_VIEW_DEFAULTS = {
  type: ORGANIZATION_PICKER_ALL_TYPES,
} as const

export function getOrganizationPickerSearchText(organization: Organization): string {
  return `${organization.name} ${getOrganizationKindLabel(organization.organizationKind)}`
}

export function filterAndSortOrganizationPickerItems(
  items: readonly OrganizationPickerItem[],
  options: {
    searchQuery: string
    type: OrganizationPickerTypeFilter
  },
): OrganizationPickerItem[] {
  const query = normalizeSearchQuery(options.searchQuery)

  return items
    .filter(({ organization }) => {
      if (
        options.type !== ORGANIZATION_PICKER_ALL_TYPES &&
        organization.organizationKind !== options.type
      ) {
        return false
      }
      return (
        query.length === 0 ||
        normalizeSearchQuery(getOrganizationPickerSearchText(organization)).includes(query)
      )
    })
    .sort((left, right) =>
      organizationNameCollator.compare(left.organization.name, right.organization.name),
    )
}

export function buildOrganizationPickerTypeOptions(
  organizations: readonly Organization[],
): { value: OrganizationPickerTypeFilter; label: string }[] {
  const availableKinds = new Set(organizations.map(({ organizationKind }) => organizationKind))
  return [
    { value: ORGANIZATION_PICKER_ALL_TYPES, label: 'All types' },
    ...ORGANIZATION_KIND_IDS.filter((kind) => availableKinds.has(kind)).map((kind) => ({
      value: kind,
      label: getOrganizationKindLabel(kind),
    })),
  ]
}

export function formatOrganizationPickerDescription(selectedCount: number): string {
  if (selectedCount === 0) return 'Choose any organizations connected to this character.'
  return `${selectedCount} ${selectedCount === 1 ? 'organization' : 'organizations'} selected.`
}
