import {
  getOrganizationKindEntry,
  getOrganizationKindLabel,
  type Organization,
} from '@rpg/contracts'

import type { ContentStatRowData } from '../../lib/detail/content-stat-rows'

export const ORGANIZATION_SECTION_LABELS = {
  connectedCharacters: 'Connected characters',
} as const

export const ORGANIZATION_EMPTY_SECTION_TEXT = {
  connectedCharacters: 'No connected characters yet.',
} as const

export type OrganizationConnectedCharacterPreviewItem = {
  card: { id: string; name: string; summary: string }
  detailHref: string
}

export type OrganizationConnectedCharactersViewModel = {
  previewItems: OrganizationConnectedCharacterPreviewItem[]
  total: number
  emptyText: string
}

export type OrganizationDetailViewModel = {
  statRows: ContentStatRowData[]
  description?: string
  connectedCharacters: OrganizationConnectedCharactersViewModel
}

export function formatConnectedCharactersCount(total: number): string {
  return `${total} connected character${total === 1 ? '' : 's'}`
}

export function buildOrganizationDetailViewModel(
  organization: Organization,
  connectedCharacters: OrganizationConnectedCharactersViewModel,
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
  }
}
