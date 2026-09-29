import type { OrganizationMembershipTitleDefinition } from '@rpg/contracts'
import { sortOrganizationMembershipTitleDefinitionsForDisplay } from '@rpg/contracts'
import { Text } from '@rpg/ui'

import {
  ORGANIZATION_EMPTY_SECTION_TEXT,
  ORGANIZATION_MEMBERSHIP_TITLES_EMPTY_SUPPORT,
} from '../../lib/organization-display'

import {
  organizationMembershipTitlesEmptyVariants,
  organizationMembershipTitlesItemVariants,
  organizationMembershipTitlesListVariants,
} from './organization-membership-titles-summary.variants'

export type OrganizationMembershipTitlesSummaryProps = {
  titles?: readonly OrganizationMembershipTitleDefinition[]
  idPrefix?: string
}

/** Read-only organization membership title catalog in canonical hierarchy order. */
export function OrganizationMembershipTitlesSummary({
  titles,
  idPrefix = 'organization-membership-titles',
}: OrganizationMembershipTitlesSummaryProps) {
  const catalog = titles ?? []
  if (catalog.length === 0) {
    return (
      <div className={organizationMembershipTitlesEmptyVariants()}>
        <Text variant="muted">{ORGANIZATION_EMPTY_SECTION_TEXT.membershipTitles}</Text>
        <Text variant="muted">{ORGANIZATION_MEMBERSHIP_TITLES_EMPTY_SUPPORT}</Text>
      </div>
    )
  }

  const sorted = sortOrganizationMembershipTitleDefinitionsForDisplay(catalog)

  return (
    <ol className={organizationMembershipTitlesListVariants()} data-testid={`${idPrefix}-list`}>
      {sorted.map((entry) => (
        <li key={entry.id} className={organizationMembershipTitlesItemVariants()}>
          {entry.label}
        </li>
      ))}
    </ol>
  )
}
