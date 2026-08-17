import {
  characterMatchesOrganizationMemberClassRecommendations,
  type CharacterClass,
} from '@rpg/contracts'
import { normalizeSearchQuery } from '@rpg/search'
import { chainComparators, compareNumberDescending } from '@rpg/search/ranking'
import { scoreLegacySearchItem } from '@rpg/ui/lib/search-document'

import { buildConnectedPartyCharacterPickerSearchText } from '../../locations/lib/location-connected-party-character-options.lib'
import { compareName, scoreAndFilterPickerItems } from '@/features/character'

import type { OrganizationMemberPickerCandidate } from '../components/organization-member-picker-drawer.client'

export const ORGANIZATION_MEMBER_PICKER_ALREADY_MEMBER_LABEL = 'Member'
export const ORGANIZATION_MEMBER_PICKER_RECOMMENDED_LABEL = 'Recommended'

const ORGANIZATION_MEMBER_STATUS_BADGE_SEPARATOR = ' · ' as const

const organizationMemberNameCollator = new Intl.Collator(undefined, {
  sensitivity: 'base',
  numeric: true,
})

export type OrganizationMemberPickerSortContext = {
  searchQuery: string
  memberClassAffinityIds?: readonly string[]
  availableClasses?: readonly CharacterClass[]
}

type OrganizationMemberPickerScoredCandidate = {
  item: OrganizationMemberPickerCandidate
  searchScore: number
  isRecommended: boolean
}

export function formatOrganizationMemberPickerStatusBadgeLabel(membershipTitle?: string): string {
  if (membershipTitle === undefined || membershipTitle.trim().length === 0) {
    return ORGANIZATION_MEMBER_PICKER_ALREADY_MEMBER_LABEL
  }

  return `${ORGANIZATION_MEMBER_PICKER_ALREADY_MEMBER_LABEL}${ORGANIZATION_MEMBER_STATUS_BADGE_SEPARATOR}${membershipTitle}`
}

type OrganizationMemberPickerRecommendationContext = {
  memberClassAffinityIds: readonly string[]
  availableClasses: readonly CharacterClass[]
}

function resolveOrganizationMemberPickerRecommendations(
  context: Pick<OrganizationMemberPickerSortContext, 'memberClassAffinityIds' | 'availableClasses'>,
): OrganizationMemberPickerRecommendationContext {
  const memberClassAffinityIds = context.memberClassAffinityIds ?? []
  const availableClasses = context.availableClasses ?? []

  if (memberClassAffinityIds.length === 0 || availableClasses.length === 0) {
    return { memberClassAffinityIds: [], availableClasses: [] }
  }

  return { memberClassAffinityIds, availableClasses }
}

export function isOrganizationMemberPickerRecommended(
  candidate: OrganizationMemberPickerCandidate,
  context: Pick<OrganizationMemberPickerSortContext, 'memberClassAffinityIds' | 'availableClasses'>,
): boolean {
  if (candidate.isMember) return false

  const recommendations = resolveOrganizationMemberPickerRecommendations(context)
  if (recommendations.memberClassAffinityIds.length === 0) return false

  return characterMatchesOrganizationMemberClassRecommendations({
    classIds: candidate.classIds ?? [],
    memberClassAffinityIds: recommendations.memberClassAffinityIds,
    availableClasses: recommendations.availableClasses,
  })
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

function compareOrganizationMemberPickerCharacterType(
  left: OrganizationMemberPickerCandidate,
  right: OrganizationMemberPickerCandidate,
): number {
  if (left.characterType === right.characterType) return 0
  return left.characterType === 'pc' ? -1 : 1
}

function compareOrganizationMemberPickerScoredCandidates(
  left: OrganizationMemberPickerScoredCandidate,
  right: OrganizationMemberPickerScoredCandidate,
  options: OrganizationMemberPickerSortContext,
): number {
  const hasQuery = normalizeSearchQuery(options.searchQuery).text.length > 0

  return chainComparators<OrganizationMemberPickerScoredCandidate>(
    (l, r) => {
      if (l.item.isMember === r.item.isMember) return 0
      return l.item.isMember ? 1 : -1
    },
    (l, r) => (hasQuery ? compareNumberDescending(l.searchScore, r.searchScore) : 0),
    (l, r) => {
      if (l.isRecommended === r.isRecommended) return 0
      return l.isRecommended ? -1 : 1
    },
    (l, r) => compareOrganizationMemberPickerCharacterType(l.item, r.item),
    (l, r) => compareName(organizationMemberNameCollator, l.item.name, r.item.name, 'asc'),
  )(left, right)
}

/** Score-once search inclusion and browse ordering for organization member picker rows. */
export function filterAndSortOrganizationMemberPickerCandidates(
  items: readonly OrganizationMemberPickerCandidate[],
  options: OrganizationMemberPickerSortContext,
): OrganizationMemberPickerCandidate[] {
  const recommendations = resolveOrganizationMemberPickerRecommendations(options)
  const filtered = scoreAndFilterPickerItems(items, {
    searchQuery: options.searchQuery,
    scoreItem: scoreOrganizationMemberPickerCandidate,
  })

  const scored = filtered.map((row) => ({
    ...row,
    isRecommended: isOrganizationMemberPickerRecommended(row.item, recommendations),
  }))

  return [...scored]
    .sort((left, right) => compareOrganizationMemberPickerScoredCandidates(left, right, options))
    .map((row) => ({
      ...row.item,
      ...(row.isRecommended ? { isRecommended: true } : {}),
    }))
}
