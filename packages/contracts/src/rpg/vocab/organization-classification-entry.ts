import type { GameTermEntry } from './types'

/** Canonical Organization classification entry with local discovery metadata. */
export type OrganizationClassificationEntry = GameTermEntry & {
  readonly aliases?: readonly string[]
  readonly searchTerms?: readonly string[]
}

/** Stable discovery projection owned by the canonical entry. */
export function getOrganizationClassificationDiscoveryTerms(
  entry: OrganizationClassificationEntry,
): readonly string[] {
  return [entry.label, ...(entry.aliases ?? []), ...(entry.searchTerms ?? [])]
}
