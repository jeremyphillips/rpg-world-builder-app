import { getOrganizationDomainEntry, type OrganizationDomain } from './organization-domain'
import type { OrganizationMemberTitleEntry } from './organization-member-title-entry'

export type { OrganizationMemberTitleEntry } from './organization-member-title-entry'
export {
  ORGANIZATION_MEMBER_TITLE_PRIORITIES,
  organizationMemberTitleEntries,
} from './organization-member-title-entry'

/** Temporary domain-only resolver; Phase 7d section 3 composes every canonical axis. */
export function resolveOrganizationMemberTitleSuggestions(input: {
  domain: OrganizationDomain
}): readonly [OrganizationMemberTitleEntry, ...OrganizationMemberTitleEntry[]] {
  return getOrganizationDomainEntry(input.domain)!.memberTitles
}

/**
 * Exact-label lookup against the same suggestion source as
 * `resolveOrganizationMemberTitleSuggestions` — suggestions and lookup cannot diverge.
 */
export function resolveOrganizationMemberTitleEntry(input: {
  domain: OrganizationDomain
  title: string
}): OrganizationMemberTitleEntry | undefined {
  const normalized = input.title.trim()
  if (normalized === '') return undefined
  return resolveOrganizationMemberTitleSuggestions({
    domain: input.domain,
  }).find((entry) => entry.label === normalized)
}
