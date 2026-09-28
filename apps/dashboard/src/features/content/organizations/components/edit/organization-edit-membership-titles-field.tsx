import { useWatch } from 'react-hook-form'
import type { OrganizationMembershipTitleDefinition } from '@rpg/contracts'

import { OrganizationMembershipTitlesSummary } from '../members/organization-membership-titles-summary'

function membersTitlesFieldPath(prefix?: string): string {
  return prefix ? `${prefix}.members.titles` : 'members.titles'
}

export type OrganizationEditMembershipTitlesFieldProps = {
  prefix?: string
}

/** Edit-form read-only view of `members.titles` from current form state. */
export function OrganizationEditMembershipTitlesField({
  prefix,
}: OrganizationEditMembershipTitlesFieldProps) {
  const titles = useWatch({
    name: membersTitlesFieldPath(prefix),
  }) as OrganizationMembershipTitleDefinition[] | undefined

  return (
    <OrganizationMembershipTitlesSummary
      titles={titles}
      idPrefix={prefix ? `${prefix}-membership-titles` : 'organization-membership-titles'}
    />
  )
}
