import {
  getOrganizationKindEntry,
  getOrganizationKindLabel,
  getOrganizationSubtypeEntry,
  getOrganizationSubtypeLabel,
  type Organization,
  type OrganizationLocationConnectionFamily,
  type OrganizationLocationConnectionKind,
} from '@rpg/contracts'

import type { ContentStatRowData } from '../../lib/detail/metadata/content-stat-rows'
import type { DrawerContextEntityPresentation } from '../../lib/relationship/drawer-context.types'
import type { LocationEntitySummaryVm } from '../../locations/lib/location-display'

export const ORGANIZATION_SECTION_LABELS = {
  members: 'Members',
  locationConnections: 'Location connections',
} as const

export const ORGANIZATION_EMPTY_SECTION_TEXT = {
  members: 'No members linked.',
  locationConnections: 'No location connections yet.',
} as const

export const ORGANIZATION_DRAWER_CONTEXT_TYPE_SUFFIX = ' · Organization' as const

export function buildOrganizationDrawerContextEntity(
  organization: Pick<Organization, 'name'>,
): DrawerContextEntityPresentation {
  return {
    heading: organization.name,
    headingSuffix: ORGANIZATION_DRAWER_CONTEXT_TYPE_SUFFIX,
  }
}

export type OrganizationLocationConnectionPreviewItem = {
  connectionId: string
  locationId: string
  kind: OrganizationLocationConnectionKind
  family: OrganizationLocationConnectionFamily
  /** null when the persisted location reference failed to resolve */
  target: LocationEntitySummaryVm | null
}

export type OrganizationLocationConnectionsViewModel = {
  previewItems: OrganizationLocationConnectionPreviewItem[]
  total: number
  emptyText: string
}

export type OrganizationDetailViewModel = {
  statRows: ContentStatRowData[]
  description?: string
  locationConnections: OrganizationLocationConnectionsViewModel
}

export function formatLocationConnectionsCount(total: number): string {
  return `${total} location connection${total === 1 ? '' : 's'}`
}

export function buildOrganizationDetailViewModel(
  organization: Organization,
  locationConnections: OrganizationLocationConnectionsViewModel,
): OrganizationDetailViewModel {
  const kindLabel = getOrganizationKindLabel(organization.organizationKind)
  const subtype =
    organization.organizationSubtype !== undefined
      ? getOrganizationSubtypeEntry(organization.organizationKind, organization.organizationSubtype)
      : undefined
  const subtypeLabel =
    organization.organizationSubtype !== undefined
      ? getOrganizationSubtypeLabel(organization.organizationKind, organization.organizationSubtype)
      : undefined

  return {
    statRows: [
      {
        label: 'Type',
        value: subtypeLabel ? `${kindLabel} · ${subtypeLabel}` : kindLabel,
        info:
          subtype?.description ??
          getOrganizationKindEntry(organization.organizationKind)?.description,
        infoAriaLabel: `About ${subtypeLabel ?? kindLabel}`,
      },
    ],
    description: organization.description || undefined,
    locationConnections,
  }
}
