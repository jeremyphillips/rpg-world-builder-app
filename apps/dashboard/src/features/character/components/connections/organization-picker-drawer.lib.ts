import {
  getOrganizationDomainLabel,
  getOrganizationClassificationDiscoveryText,
  ORGANIZATION_DOMAIN_IDS,
  type Organization,
} from '@rpg/contracts'
import { normalizeSearchQuery } from '@rpg/ui'

import {
  ORGANIZATION_PICKER_ALL_DOMAINS,
  ORGANIZATION_PICKER_DESCRIPTION,
  type OrganizationPickerItem,
  type OrganizationPickerDomainFilter,
} from './organization-picker-drawer.types'

const organizationNameCollator = new Intl.Collator(undefined, {
  sensitivity: 'base',
  numeric: true,
})

export const ORGANIZATION_PICKER_VIEW_DEFAULTS = {
  domain: ORGANIZATION_PICKER_ALL_DOMAINS,
} as const

export function getOrganizationPickerSearchText(organization: Organization): string {
  return `${organization.name} ${getOrganizationClassificationDiscoveryText(organization)}`
}

export function filterAndSortOrganizationPickerItems(
  items: readonly OrganizationPickerItem[],
  options: {
    searchQuery: string
    domain: OrganizationPickerDomainFilter
  },
): OrganizationPickerItem[] {
  const query = normalizeSearchQuery(options.searchQuery)

  return items
    .filter(({ organization }) => {
      if (
        options.domain !== ORGANIZATION_PICKER_ALL_DOMAINS &&
        organization.organizationDomain !== options.domain
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

export function buildOrganizationPickerDomainOptions(
  organizations: readonly Organization[],
): { value: OrganizationPickerDomainFilter; label: string }[] {
  const availableKinds = new Set(organizations.map(({ organizationDomain }) => organizationDomain))
  return [
    { value: ORGANIZATION_PICKER_ALL_DOMAINS, label: 'All domains' },
    ...ORGANIZATION_DOMAIN_IDS.filter((kind) => availableKinds.has(kind)).map((kind) => ({
      value: kind,
      label: getOrganizationDomainLabel(kind),
    })),
  ]
}

export function formatOrganizationPickerDescription(): string {
  return ORGANIZATION_PICKER_DESCRIPTION
}
