import {
  getOrganizationKindEntry,
  getOrganizationKindLabel,
  getOrganizationSubtypeEntry,
  getOrganizationSubtypeLabel,
  type Organization,
  type OrganizationLocationConnectionFamily,
  type OrganizationLocationConnectionKind,
} from '@rpg/contracts'

import type { ContentStatRowData } from '../../lib/detail/content-stat-rows'
import type { DrawerContextEntityPresentation } from '../../lib/relationship/drawer-context.types'
import type { LocationEntitySummaryVm } from '../../locations/lib/location-display'

import type { CharacterEntitySummaryVm } from '@/features/character'

export const ORGANIZATION_SECTION_LABELS = {
  connectedCharacters: 'Connected characters',
  locationConnections: 'Location connections',
} as const

export const ORGANIZATION_EMPTY_SECTION_TEXT = {
  connectedCharacters: 'No connected characters yet.',
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

export type OrganizationConnectedCharacterPreviewItem = {
  summary: CharacterEntitySummaryVm
  detailHref: string
}

export type OrganizationConnectedCharactersViewModel = {
  previewItems: OrganizationConnectedCharacterPreviewItem[]
  total: number
  emptyText: string
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
  connectedCharacters: OrganizationConnectedCharactersViewModel
  locationConnections: OrganizationLocationConnectionsViewModel
}

export function formatConnectedCharactersCount(total: number): string {
  return `${total} connected character${total === 1 ? '' : 's'}`
}

export function formatLocationConnectionsCount(total: number): string {
  return `${total} location connection${total === 1 ? '' : 's'}`
}

export function buildOrganizationDetailViewModel(
  organization: Organization,
  connectedCharacters: OrganizationConnectedCharactersViewModel,
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
    connectedCharacters,
    locationConnections,
  }
}
