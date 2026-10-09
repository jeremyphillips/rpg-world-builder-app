import {
  catalogNounFromContentType,
  getOrganizationClassificationDiscoveryTerms,
  getOrganizationDomainLabel,
  getOrganizationClassificationDiscoveryText,
  ORGANIZATION_DOMAIN_IDS,
  type Organization,
} from '@rpg/contracts'
import { scoreSearchDocument, type SearchDocument } from '@rpg/search'
import { normalizeSearchQuery } from '@rpg/ui'

import {
  chainComparators,
  scoreAndFilterPickerItems,
} from '../../picker/sort/catalog-picker-sort.lib'
import {
  ORGANIZATION_PICKER_ALL_DOMAINS,
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

function assembleOrganizationPickerSearchDocument(organization: Organization): SearchDocument {
  const terms = getOrganizationClassificationDiscoveryTerms(organization)
  return {
    id: organization.id,
    fields: [
      { key: 'name', text: organization.name, role: 'primary' },
      ...terms.map((term, index) => ({
        key: `term:${index}`,
        text: term,
        role: 'keyword' as const,
      })),
      {
        key: 'combined',
        text: getOrganizationPickerSearchText(organization),
        role: 'secondary' as const,
      },
    ],
  }
}

function scoreOrganizationPickerItem(item: OrganizationPickerItem, searchQuery: string): number {
  return scoreSearchDocument(
    assembleOrganizationPickerSearchDocument(item.organization),
    searchQuery,
    {
      profile: 'forgiving',
    },
  )
}

export function filterAndSortOrganizationPickerItems(
  items: readonly OrganizationPickerItem[],
  options: {
    searchQuery: string
    domain: OrganizationPickerDomainFilter
  },
): OrganizationPickerItem[] {
  const hasQuery = normalizeSearchQuery(options.searchQuery).length > 0
  const domainFiltered = items.filter(({ organization }) => {
    if (
      options.domain !== ORGANIZATION_PICKER_ALL_DOMAINS &&
      organization.organizationDomain !== options.domain
    ) {
      return false
    }
    return true
  })

  const scored = scoreAndFilterPickerItems(domainFiltered, {
    searchQuery: options.searchQuery,
    scoreItem: scoreOrganizationPickerItem,
  })

  return [...scored]
    .sort(
      chainComparators(
        (left, right) => (hasQuery ? right.searchScore - left.searchScore : 0),
        (left, right) =>
          organizationNameCollator.compare(
            left.item.organization.name,
            right.item.organization.name,
          ),
      ),
    )
    .map((row) => row.item)
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
  const organization = catalogNounFromContentType('organizations')
  return `Choose an ${organization.singular} connected to this character.`
}
