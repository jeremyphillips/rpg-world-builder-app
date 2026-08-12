import { normalizeSearchQuery } from '@rpg/search'
import { chainComparators, compareNumberDescending } from '@rpg/search/ranking'
import { scoreLegacySearchItem } from '@rpg/ui/lib/search-document'

import { buildConnectedPartyCharacterPickerSearchText } from '../../locations/lib/location-connected-party-character-options.lib'
import { compareName, scoreAndFilterPickerItems } from '@/features/character'

import type { OrganizationMemberPickerCandidate } from '../components/organization-member-picker-drawer.client'

export const ORGANIZATION_MEMBER_PICKER_ALREADY_MEMBER_LABEL = 'Member'

const ORGANIZATION_MEMBER_STATUS_BADGE_SEPARATOR = ' · ' as const

const organizationMemberNameCollator = new Intl.Collator(undefined, {
  sensitivity: 'base',
  numeric: true,
})

type OrganizationMemberPickerScoredCandidate = {
  item: OrganizationMemberPickerCandidate
  searchScore: number
}

export function formatOrganizationMemberPickerStatusBadgeLabel(membershipTitle?: string): string {
  if (membershipTitle === undefined || membershipTitle.trim().length === 0) {
    return ORGANIZATION_MEMBER_PICKER_ALREADY_MEMBER_LABEL
  }

  return `${ORGANIZATION_MEMBER_PICKER_ALREADY_MEMBER_LABEL}${ORGANIZATION_MEMBER_STATUS_BADGE_SEPARATOR}${membershipTitle}`
}

function scoreOrganizationMemberPickerCandidate(
  candidate: OrganizationMemberPickerCandidate,
  searchQuery: string,
): number {
  return scoreLegacySearchItem(
    {
      fields: [
        {
          text: buildConnectedPartyCharacterPickerSearchText(candidate),
          weight: 1,
          role: 'label',
        },
      ],
    },
    searchQuery,
    'forgiving',
  )
}

function compareOrganizationMemberPickerScoredCandidates(
  left: OrganizationMemberPickerScoredCandidate,
  right: OrganizationMemberPickerScoredCandidate,
  options: { searchQuery: string },
): number {
  const hasQuery = normalizeSearchQuery(options.searchQuery).text.length > 0

  return chainComparators<OrganizationMemberPickerScoredCandidate>(
    (l, r) => {
      if (l.item.isMember === r.item.isMember) return 0
      return l.item.isMember ? 1 : -1
    },
    (l, r) => (hasQuery ? compareNumberDescending(l.searchScore, r.searchScore) : 0),
    (l, r) => compareName(organizationMemberNameCollator, l.item.name, r.item.name, 'asc'),
  )(left, right)
}

/** Score-once search inclusion and browse ordering for organization member picker rows. */
export function filterAndSortOrganizationMemberPickerCandidates(
  items: readonly OrganizationMemberPickerCandidate[],
  options: { searchQuery: string },
): OrganizationMemberPickerCandidate[] {
  const filtered = scoreAndFilterPickerItems(items, {
    searchQuery: options.searchQuery,
    scoreItem: scoreOrganizationMemberPickerCandidate,
  })

  return [...filtered]
    .sort((left, right) => compareOrganizationMemberPickerScoredCandidates(left, right, options))
    .map((row) => row.item)
}
