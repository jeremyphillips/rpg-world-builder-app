import {
  getOrganizationKindEntry,
  getOrganizationKindLabel,
  type Organization,
} from '@rpg/contracts'

import type { ContentStatRowData } from '../../lib/detail/content-stat-rows'

export const ORGANIZATION_SECTION_LABELS = {
  connectedCharacters: 'Connected characters',
  connectedRegions: 'Connected regions',
} as const

export const ORGANIZATION_EMPTY_SECTION_TEXT = {
  connectedCharacters: 'No connected characters yet.',
  connectedRegions: 'No connected regions yet.',
} as const

export type OrganizationConnectedCharacterPreviewItem = {
  card: { id: string; name: string; summary: string }
  detailHref: string
}

export type OrganizationConnectedRegionPreviewItem = {
  relationshipId: string
  card: { id: string; name: string; summary: string }
  detailHref: string
}

export type OrganizationConnectedCharactersViewModel = {
  previewItems: OrganizationConnectedCharacterPreviewItem[]
  total: number
  emptyText: string
}

export type OrganizationConnectedRegionsViewModel = {
  previewItems: OrganizationConnectedRegionPreviewItem[]
  total: number
  emptyText: string
}

export type OrganizationDetailViewModel = {
  statRows: ContentStatRowData[]
  description?: string
  connectedCharacters: OrganizationConnectedCharactersViewModel
  connectedRegions: OrganizationConnectedRegionsViewModel
}

export function formatConnectedCharactersCount(total: number): string {
  return `${total} connected character${total === 1 ? '' : 's'}`
}

export function formatConnectedRegionsCount(total: number): string {
  return `${total} connected region link${total === 1 ? '' : 's'}`
}

export function buildOrganizationDetailViewModel(
  organization: Organization,
  connectedCharacters: OrganizationConnectedCharactersViewModel,
  connectedRegions: OrganizationConnectedRegionsViewModel,
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
    connectedCharacters,
    connectedRegions,
  }
}
