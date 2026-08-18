/** Descending presentation ranks for organization membership title hierarchy (higher first). */
export const ORGANIZATION_MEMBERSHIP_TITLE_PRIORITIES = [50, 40, 30, 20, 10] as const

export type OrganizationMembershipTitlePriority =
  (typeof ORGANIZATION_MEMBERSHIP_TITLE_PRIORITIES)[number]
