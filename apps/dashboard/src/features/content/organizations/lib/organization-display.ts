import {
  getOrganizationKindEntry,
  getOrganizationKindLabel,
  type Organization,
} from '@rpg/contracts'

import type { CharacterListCardPreviewItem } from '@/features/character/components/character-list-card.lib'

import type { ContentStatRowData } from '../../lib/detail/content-stat-rows'

export const ORGANIZATION_SECTION_LABELS = {
  connectedCharacters: 'Connected characters',
} as const

export const ORGANIZATION_EMPTY_SECTION_TEXT = {
  connectedCharacters: 'No characters are connected to this organization.',
} as const

export type OrganizationConnectedCharactersViewModel = {
  previewItems: CharacterListCardPreviewItem[]
  total: number
  emptyText: string
}

export type OrganizationDetailViewModel = {
  statRows: ContentStatRowData[]
  description?: string
  connectedCharacters: OrganizationConnectedCharactersViewModel
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
