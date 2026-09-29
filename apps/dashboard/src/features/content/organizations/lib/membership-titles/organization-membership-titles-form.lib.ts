import {
  createDefaultOrganizationMembershipTitleDefinition,
  createOrganizationMembershipTitleId,
  ORGANIZATION_MEMBERSHIP_TITLE_PRIORITIES,
  type OrganizationMembershipTitleDefinition,
  type OrganizationMembershipTitlePriority,
} from '@rpg/contracts'

export const ORGANIZATION_MEMBERSHIP_TITLE_PRIORITY_LABELS: Record<
  OrganizationMembershipTitlePriority,
  string
> = {
  50: 'Highest (50)',
  40: 'High (40)',
  30: 'Mid (30)',
  20: 'Low (20)',
  10: 'Lowest (10)',
}

export const organizationMembershipTitlePriorityOptions =
  ORGANIZATION_MEMBERSHIP_TITLE_PRIORITIES.map((priority) => ({
    value: String(priority),
    label: ORGANIZATION_MEMBERSHIP_TITLE_PRIORITY_LABELS[priority],
  }))

export function createOrganizationMembershipTitleFormRow(
  createId: () => string = createOrganizationMembershipTitleId,
): OrganizationMembershipTitleDefinition {
  return createDefaultOrganizationMembershipTitleDefinition(createId)
}

export function parseOrganizationMembershipTitlePriorityValue(
  value: string,
): OrganizationMembershipTitlePriority {
  const parsed = Number.parseInt(value, 10)
  if (
    ORGANIZATION_MEMBERSHIP_TITLE_PRIORITIES.includes(parsed as OrganizationMembershipTitlePriority)
  ) {
    return parsed as OrganizationMembershipTitlePriority
  }
  return 10
}
