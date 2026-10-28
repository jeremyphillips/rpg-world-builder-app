import type { OrganizationMembershipTitleDefinition } from '@rpg/contracts'
import { sortOrganizationMembershipTitleDefinitionsForDisplay } from '@rpg/contracts'
import { Text } from '@rpg/ui'

import {
  ORGANIZATION_EMPTY_SECTION_TEXT,
  ORGANIZATION_MEMBERSHIP_TITLES_EMPTY_SUPPORT,
} from '../../lib/organization-display'

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
      <div className="space-y-1">
        <Text variant="muted">{ORGANIZATION_EMPTY_SECTION_TEXT.membershipTitles}</Text>
        <Text variant="muted">{ORGANIZATION_MEMBERSHIP_TITLES_EMPTY_SUPPORT}</Text>
      </div>
    )
  }

  const sorted = sortOrganizationMembershipTitleDefinitionsForDisplay(catalog)

  return (
    <ol className="list-none space-y-1" data-testid={`${idPrefix}-list`}>
      {sorted.map((entry) => (
        <li key={entry.id} className="text-style-body-compact">
          {entry.label}
        </li>
      ))}
    </ol>
  )
}
