import {
  getOrganizationKindEntry,
  getOrganizationKindLabel,
  type Organization,
} from '@rpg/contracts'

import type { ContentStatRowData } from '../../lib/detail/content-stat-rows'

export type OrganizationDetailViewModel = {
  statRows: ContentStatRowData[]
  description?: string
}

export function buildOrganizationDetailViewModel(
  organization: Organization,
): OrganizationDetailViewModel {
  const kindLabel = getOrganizationKindLabel(organization.organizationKind)
  return {
    statRows: [
      {
        label: 'Type',
        value: kindLabel,
        info: getOrganizationKindEntry(organization.organizationKind)?.description,
        infoAriaLabel: `About ${kindLabel}`,
      },
    ],
    description: organization.description || undefined,
  }
}
