import type {
  OrganizationDomain,
  OrganizationForm,
  OrganizationFunction,
  OrganizationPractice,
} from '@rpg/contracts'

/** UI-only sentinel — never persisted as a membership title. */
export const ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE = '__no_title__'

export type OrganizationMembershipTitleFieldProps = {
  kind: OrganizationDomain
  form?: OrganizationForm
  functions?: readonly OrganizationFunction[]
  practices?: readonly OrganizationPractice[]
  value: string
  onValueChange: (value: string) => void
  idPrefix: string
}
