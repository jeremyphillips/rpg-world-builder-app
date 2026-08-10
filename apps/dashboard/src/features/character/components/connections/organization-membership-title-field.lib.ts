import { resolveOrganizationMemberTitleSuggestions } from '@rpg/contracts'

import { ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE } from './organization-membership-title-field.types'
import type { OrganizationMembershipTitleFieldProps } from './organization-membership-title-field.types'

export function buildOrganizationMembershipTitleRadioOptions(input: {
  kind: OrganizationMembershipTitleFieldProps['kind']
  subtype?: string
  /** Current persisted/selected title — appended when absent from suggestions. */
  currentValue?: string
}): { value: string; label: string }[] {
  const suggestions = resolveOrganizationMemberTitleSuggestions({
    kind: input.kind,
    subtype: input.subtype,
  })
  const suggestionValues = new Set<string>(suggestions.map((entry) => entry.label))
  const options = [
    { value: ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE, label: 'No title' },
    ...suggestions.map((entry) => ({ value: entry.label, label: entry.label })),
  ]

  const current = input.currentValue?.trim()
  if (
    current &&
    current !== ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE &&
    !suggestionValues.has(current)
  ) {
    options.push({ value: current, label: current })
  }

  return options
}

/** Maps radio value → optional persisted title (undefined when No title). */
export function titleFromMembershipRadioValue(value: string): string | undefined {
  if (value === ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE || value.trim() === '') {
    return undefined
  }
  return value
}

/** Maps optional persisted title → radio value. */
export function membershipRadioValueFromTitle(title: string | undefined | null): string {
  if (title === undefined || title === null || title.trim() === '') {
    return ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE
  }
  return title
}
