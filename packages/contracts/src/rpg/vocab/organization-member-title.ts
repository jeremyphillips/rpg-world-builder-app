import {
  getOrganizationActivityEntry,
  type OrganizationActivity,
} from './organization-activity'
import { getOrganizationDomainEntry, type OrganizationDomain } from './organization-domain'
import { getOrganizationFormEntry, type OrganizationForm } from './organization-form'
import type { OrganizationMemberTitleEntry } from './organization-member-title-entry'

export type { OrganizationMemberTitleEntry } from './organization-member-title-entry'
export {
  ORGANIZATION_MEMBER_TITLE_PRIORITIES,
  organizationMemberTitleEntries,
} from './organization-member-title-entry'

export type OrganizationMemberTitleClassification = {
  domain: OrganizationDomain
  form?: OrganizationForm
  activities?: readonly OrganizationActivity[]
}

/**
 * Composes local registry suggestions without encoding familiar subtype tuples.
 * Local rank is primary; at the same rank activities precede form, then domain.
 */
export function resolveOrganizationMemberTitleSuggestions(
  input: OrganizationMemberTitleClassification,
): readonly [OrganizationMemberTitleEntry, ...OrganizationMemberTitleEntry[]] {
  const contributions = [
    ...(input.activities ?? []).map((activity) => getOrganizationActivityEntry(activity)!.memberTitles),
    ...(input.form ? [getOrganizationFormEntry(input.form)!.memberTitles] : []),
    getOrganizationDomainEntry(input.domain)!.memberTitles,
  ]
  const maxLength = Math.max(...contributions.map((entries) => entries.length))
  const seen = new Set<string>()
  const resolved: OrganizationMemberTitleEntry[] = []

  for (let rank = 0; rank < maxLength; rank += 1) {
    for (const contribution of contributions) {
      const entry = contribution[rank]
      if (!entry) continue
      const normalized = entry.label.trim().toLocaleLowerCase('en')
      if (seen.has(normalized)) continue
      seen.add(normalized)
      resolved.push(entry)
    }
  }

  return resolved as [OrganizationMemberTitleEntry, ...OrganizationMemberTitleEntry[]]
}

/** Exact-label lookup against the same compositional source as suggestions. */
export function resolveOrganizationMemberTitleEntry(
  input: OrganizationMemberTitleClassification & { title: string },
): OrganizationMemberTitleEntry | undefined {
  const normalized = input.title.trim()
  if (normalized === '') return undefined
  return resolveOrganizationMemberTitleSuggestions(input).find((entry) => entry.label === normalized)
}
