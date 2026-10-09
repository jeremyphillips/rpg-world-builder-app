import {
  catalogNounFromContentType,
  listOrganizationClassificationDiscoveryTerms,
  getOrganizationClassificationDiscoveryText,
  type Organization,
} from '@rpg/contracts'
import { scoreSearchDocument, type SearchDocument } from '@rpg/search'
import { normalizeSearchQuery } from '@rpg/ui'

import { comparePickerName } from '@/lib/catalog-picker/compare-picker-name'

import {
  chainComparators,
  scoreAndFilterPickerItems,
} from '../../picker/sort/catalog-picker-sort.lib'
import { type OrganizationPickerItem } from './organization-picker-drawer.types'

export function getOrganizationPickerSearchText(organization: Organization): string {
  const combined = assembleOrganizationPickerSearchDocument(organization).fields.find(
    (field) => field.key === 'combined',
  )
  return combined?.text ?? organization.name
}

export function assembleOrganizationPickerSearchDocument(
  organization: Organization,
): SearchDocument {
  const terms = listOrganizationClassificationDiscoveryTerms(organization)
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
        text: `${organization.name} ${getOrganizationClassificationDiscoveryText(organization)}`,
        role: 'secondary' as const,
      },
    ],
  }
}

export function scoreOrganizationPickerItem(
  item: OrganizationPickerItem,
  searchQuery: string,
): number {
  return scoreSearchDocument(
    assembleOrganizationPickerSearchDocument(item.organization),
    searchQuery,
    {
      profile: 'forgiving',
    },
  )
}

/** Search-score, then name. Domain filtering belongs to the relationship filter schema. */
export function scoreAndSortOrganizationPickerItems(
  items: readonly OrganizationPickerItem[],
  options: {
    searchQuery: string
  },
): OrganizationPickerItem[] {
  const hasQuery = normalizeSearchQuery(options.searchQuery).length > 0
  const scored = scoreAndFilterPickerItems(items, {
    searchQuery: options.searchQuery,
    scoreItem: scoreOrganizationPickerItem,
  })

  return scored
    .toSorted(
      chainComparators(
        (left, right) => (hasQuery ? right.searchScore - left.searchScore : 0),
        (left, right) =>
          comparePickerName(
            { name: left.item.organization.name, id: left.item.organization.id },
            { name: right.item.organization.name, id: right.item.organization.id },
          ),
      ),
    )
    .map((row) => row.item)
}

export function formatOrganizationPickerDescription(): string {
  const organization = catalogNounFromContentType('organizations')
  return `Choose an ${organization.singular} connected to this character.`
}
