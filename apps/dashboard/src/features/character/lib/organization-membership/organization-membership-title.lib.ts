import type { OrganizationMembershipTitleDefinition } from '@rpg/contracts'
import {
  resolveSoleOrganizationMembershipTitleId,
  sortOrganizationMembershipTitleDefinitionsForDisplay,
} from '@rpg/contracts'

export function buildOrganizationMembershipTitleRadioOptions(input: {
  titles: readonly OrganizationMembershipTitleDefinition[]
  /** Current persisted/selected catalog id. */
  currentMembershipTitleId?: string
}): { value: string; label: string }[] {
  const suggestions = sortOrganizationMembershipTitleDefinitionsForDisplay(input.titles)
  return suggestions.map((entry) => ({ value: entry.id, label: entry.label }))
}

/** Maps radio value → persisted membership title id. */
export function membershipTitleIdFromRadioValue(value: string): string {
  const membershipTitleId = value.trim()
  if (membershipTitleId === '') {
    throw new Error('Organization membership title id is required.')
  }
  return membershipTitleId
}

/** Maps persisted membership title id → radio value. */
export function membershipRadioValueFromMembershipTitleId(
  membershipTitleId: string | undefined | null,
  catalog?: readonly OrganizationMembershipTitleDefinition[],
): string | undefined {
  if (
    membershipTitleId === undefined ||
    membershipTitleId === null ||
    membershipTitleId.trim() === ''
  ) {
    return resolveSoleOrganizationMembershipTitleId(catalog ?? [])
  }
  if (catalog !== undefined && !catalog.some((entry) => entry.id === membershipTitleId)) {
    return undefined
  }
  return membershipTitleId
}

/** @deprecated Use membershipTitleIdFromRadioValue — label-based mapping removed. */
export function titleFromMembershipRadioValue(value: string): string {
  return membershipTitleIdFromRadioValue(value)
}

/** @deprecated Use membershipRadioValueFromMembershipTitleId. */
export function membershipRadioValueFromTitle(
  title: string | undefined | null,
): string | undefined {
  return membershipRadioValueFromMembershipTitleId(title)
}
