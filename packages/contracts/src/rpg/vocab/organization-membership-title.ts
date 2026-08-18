import type { GameTermEntry } from './types'
import {
  ORGANIZATION_MEMBERSHIP_TITLE_ENTRIES,
  type OrganizationMembershipTitleId,
} from './organization-membership-title-entries'

export type { OrganizationMembershipTitleId } from './organization-membership-title-entries'
export { ORGANIZATION_MEMBERSHIP_TITLE_ENTRIES } from './organization-membership-title-entries'

/** Canonical reusable organization membership title — no priority (contextual per preset/org). */
export type OrganizationMembershipTitleEntry = GameTermEntry & {
  readonly searchTerms?: readonly string[]
}

import type { VocabularyTerm } from './types'

export const ORGANIZATION_MEMBERSHIP_TITLE_TERM = {
  label: 'Organization Membership Title',
  description:
    'Reusable canonical title for organization membership rosters. Not exhaustive of valid organization titles.',
  sentence: {
    singular: 'organization membership title',
    plural: 'organization membership titles',
  },
} as const satisfies VocabularyTerm

export function getOrganizationMembershipTitleEntry(
  titleId: string,
): OrganizationMembershipTitleEntry | undefined {
  return ORGANIZATION_MEMBERSHIP_TITLE_ENTRIES[titleId as OrganizationMembershipTitleId] as
    | OrganizationMembershipTitleEntry
    | undefined
}

/** Discovery terms for vocabulary search — label plus optional searchTerms only. */
export function getOrganizationMembershipTitleDiscoveryTerms(
  titleId: OrganizationMembershipTitleId,
): readonly string[] {
  const entry = getOrganizationMembershipTitleEntry(titleId)
  if (!entry) return []
  return [entry.label, ...(entry.searchTerms ?? [])]
}
