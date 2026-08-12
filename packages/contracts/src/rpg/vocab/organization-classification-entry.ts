import type { OrganizationMemberTitleEntry } from './organization-member-title-entry'
import type { GameTermEntry } from './types'

/** Canonical Organization classification entry with local discovery and title metadata. */
export type OrganizationClassificationEntry = GameTermEntry & {
  readonly aliases?: readonly string[]
  readonly searchTerms?: readonly string[]
  readonly memberTitles: readonly [OrganizationMemberTitleEntry, ...OrganizationMemberTitleEntry[]]
}

/** Stable discovery projection owned by the canonical entry. */
export function getOrganizationClassificationDiscoveryTerms(
  entry: OrganizationClassificationEntry,
): readonly string[] {
  return [entry.label, ...(entry.aliases ?? []), ...(entry.searchTerms ?? [])]
}
