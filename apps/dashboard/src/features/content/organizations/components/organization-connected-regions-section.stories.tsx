import type { Meta, StoryObj } from '@storybook/react-vite'

import { ORGANIZATION_CONNECTED_REGIONS_LOAD_ERROR } from '../lib/organization-connected-regions.constants'
import { OrganizationConnectedRegionsSection } from './organization-connected-regions-section.client'
import { ORGANIZATION_EMPTY_SECTION_TEXT } from '../lib/organization-display'

const meta = {
  title: 'Content/Organizations/OrganizationConnectedRegionsSection',
  component: OrganizationConnectedRegionsSection,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof OrganizationConnectedRegionsSection>

export default meta
type Story = StoryObj<typeof OrganizationConnectedRegionsSection>

const previewItems = [
  {
    relationshipId: 'ta-governs',
    relationshipFamily: 'territorialAuthority' as const,
    relationshipKind: 'governs',
    regionId: 'region-1',
    card: {
      id: 'region-1',
      name: 'Grey Coast',
      summary: 'Territorial authority · Governs',
    },
    detailHref: '/campaigns/camp-1/locations/region-1',
    canEditTerritorial: false,
  },
  {
    relationshipId: 'assoc-hq',
    relationshipFamily: 'partyAssociation' as const,
    relationshipKind: 'headquarters',
    regionId: 'region-2',
    card: {
      id: 'region-2',
      name: 'Sunset Vale',
      summary: 'People & organizations · Headquarters',
    },
    detailHref: '/campaigns/camp-1/locations/region-2',
    canEditTerritorial: false,
  },
]

export const WithPreview: Story = {
  args: {
    campaignId: 'camp-1',
    connectedRegions: {
      previewItems,
      total: 5,
      emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.connectedRegions,
    },
  },
}

export const WithInverseWriteControls: Story = {
  args: {
    campaignId: 'camp-1',
    canWriteInverseTerritorial: true,
    connectedRegions: {
      previewItems: previewItems.map((item) => ({
        ...item,
        canEditTerritorial: item.relationshipFamily === 'territorialAuthority',
      })),
      total: 2,
      emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.connectedRegions,
    },
    onAddTerritorialAuthority: async () => undefined,
    onRemoveTerritorialAuthority: async () => undefined,
    onUpdateTerritorialAuthorityKind: async () => undefined,
  },
}

export const Empty: Story = {
  args: {
    campaignId: 'camp-1',
    connectedRegions: {
      previewItems: [],
      total: 0,
      emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.connectedRegions,
    },
  },
}

export const Loading: Story = {
  args: {
    campaignId: 'camp-1',
    connectedRegions: {
      previewItems: [],
      total: 0,
      emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.connectedRegions,
    },
    isPending: true,
  },
}

export const Error: Story = {
  args: {
    campaignId: 'camp-1',
    connectedRegions: {
      previewItems: [],
      total: 0,
      emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.connectedRegions,
    },
    isError: true,
    errorText: ORGANIZATION_CONNECTED_REGIONS_LOAD_ERROR,
  },
}
