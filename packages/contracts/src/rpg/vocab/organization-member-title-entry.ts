import type { PrioritizedEntry } from './types'

/** Structured member-title suggestion — label plus presentation priority. */
export type OrganizationMemberTitleEntry = PrioritizedEntry & {
  readonly label: string
}

/** Descending presentation ranks for five-slot title lists (higher first). */
export const ORGANIZATION_MEMBER_TITLE_PRIORITIES = [50, 40, 30, 20, 10] as const

type FiveTitleLabels = readonly [string, string, string, string, string]

/** Builds a five-entry title list with canonical 50/40/30/20/10 priorities. */
export function organizationMemberTitleEntries(
  ...labels: FiveTitleLabels
): readonly [
  OrganizationMemberTitleEntry,
  OrganizationMemberTitleEntry,
  OrganizationMemberTitleEntry,
  OrganizationMemberTitleEntry,
  OrganizationMemberTitleEntry,
] {
  return [
    { label: labels[0], priority: ORGANIZATION_MEMBER_TITLE_PRIORITIES[0] },
    { label: labels[1], priority: ORGANIZATION_MEMBER_TITLE_PRIORITIES[1] },
    { label: labels[2], priority: ORGANIZATION_MEMBER_TITLE_PRIORITIES[2] },
    { label: labels[3], priority: ORGANIZATION_MEMBER_TITLE_PRIORITIES[3] },
    { label: labels[4], priority: ORGANIZATION_MEMBER_TITLE_PRIORITIES[4] },
  ] as const
}
