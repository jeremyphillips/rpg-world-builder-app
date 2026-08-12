import type { OrganizationDomain } from '@rpg/contracts'

/** UI-only sentinel — never persisted as a membership title. */
export const ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE = '__no_title__'

export type OrganizationMembershipTitleFieldProps = {
  kind: OrganizationDomain
  subtype?: string
  value: string
  onValueChange: (value: string) => void
  idPrefix: string
}
