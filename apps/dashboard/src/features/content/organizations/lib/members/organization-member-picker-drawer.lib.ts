import {
  characterMatchesOrganizationMemberClassRecommendations,
  characterMatchesOrganizationMemberSpeciesRecommendations,
  type CharacterClass,
  type Species,
} from '@rpg/contracts'
import { normalizeSearchQuery } from '@rpg/search'
import { chainComparators, compareNumberDescending } from '@rpg/search/ranking'
import { scoreLegacySearchItem } from '@rpg/ui/lib/search-document'

import { buildConnectedPartyCharacterPickerSearchText } from '../../../locations/lib/connected-parties/location-connected-party-character-options.lib'
import { compareName, scoreAndFilterPickerItems } from '@/features/character'

import type { OrganizationMemberPickerCandidate } from '../../components/members/organization-member-picker-drawer.client'

export const ORGANIZATION_MEMBER_PICKER_ALREADY_MEMBER_LABEL = 'Member'
export const ORGANIZATION_MEMBER_PICKER_RECOMMENDED_LABEL = 'Recommended'

const ORGANIZATION_MEMBER_STATUS_BADGE_SEPARATOR = ' · ' as const

const organizationMemberNameCollator = new Intl.Collator(undefined, {
  sensitivity: 'base',
  numeric: true,
})

export type OrganizationMemberSelectionPolicy = {
  classAffinityIds: readonly string[]
  speciesAffinityIds: readonly string[]
  playableClasses: readonly CharacterClass[]
  playableSpecies: readonly Species[]
}

export type OrganizationMemberPickerSortContext = {
  searchQuery: string
  memberSelectionPolicy?: OrganizationMemberSelectionPolicy
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

function resolveOrganizationMemberPickerSelectionPolicy(
  policy: OrganizationMemberSelectionPolicy | undefined,
): OrganizationMemberSelectionPolicy | undefined {
  if (policy === undefined) return undefined

  const classAffinityIds = policy.classAffinityIds ?? []
  const speciesAffinityIds = policy.speciesAffinityIds ?? []
  const playableClasses = policy.playableClasses ?? []
  const playableSpecies = policy.playableSpecies ?? []

  const hasClassAffinities = classAffinityIds.length > 0 && playableClasses.length > 0
  const hasSpeciesAffinities = speciesAffinityIds.length > 0 && playableSpecies.length > 0

  if (!hasClassAffinities && !hasSpeciesAffinities) return undefined

  return {
    classAffinityIds,
    speciesAffinityIds,
    playableClasses,
    playableSpecies,
  }
}

export function isOrganizationMemberPickerRecommended(
  candidate: OrganizationMemberPickerCandidate,
  policy: OrganizationMemberSelectionPolicy | undefined,
): boolean {
  if (candidate.isMember) return false

  const selectionPolicy = resolveOrganizationMemberPickerSelectionPolicy(policy)
  if (selectionPolicy === undefined) return false

  const matchesClass =
    selectionPolicy.classAffinityIds.length > 0 &&
    selectionPolicy.playableClasses.length > 0 &&
    characterMatchesOrganizationMemberClassRecommendations({
      classIds: candidate.classIds ?? [],
      classAffinityIds: selectionPolicy.classAffinityIds,
      playableClasses: selectionPolicy.playableClasses,
    })

  const matchesSpecies =
    selectionPolicy.speciesAffinityIds.length > 0 &&
    selectionPolicy.playableSpecies.length > 0 &&
    characterMatchesOrganizationMemberSpeciesRecommendations({
      speciesId: candidate.speciesId,
      speciesAffinityIds: selectionPolicy.speciesAffinityIds,
      playableSpecies: selectionPolicy.playableSpecies,
    })

  return matchesClass || matchesSpecies
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
  const selectionPolicy = resolveOrganizationMemberPickerSelectionPolicy(
    options.memberSelectionPolicy,
  )
  const filtered = scoreAndFilterPickerItems(items, {
    searchQuery: options.searchQuery,
    scoreItem: scoreOrganizationMemberPickerCandidate,
  })

  const scored = filtered.map((row) => ({
    ...row,
    isRecommended: isOrganizationMemberPickerRecommended(row.item, selectionPolicy),
  }))

  return [...scored]
    .sort((left, right) => compareOrganizationMemberPickerScoredCandidates(left, right, options))
    .map((row) => ({
      ...row.item,
      ...(row.isRecommended ? { isRecommended: true } : {}),
    }))
}
