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

export const WithPreview: Story = {
  args: {
    connectedRegions: {
      previewItems: [
        {
          card: {
            id: 'region-1',
            name: 'Grey Coast',
            summary: 'Territorial authority · Governs',
          },
          detailHref: '/campaigns/camp-1/locations/region-1',
        },
        {
          card: {
            id: 'region-2',
            name: 'Sunset Vale',
            summary: 'People & organizations · Headquarters',
          },
          detailHref: '/campaigns/camp-1/locations/region-2',
        },
      ],
      total: 5,
      emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.connectedRegions,
    },
  },
}

export const Empty: Story = {
  args: {
    connectedRegions: {
      previewItems: [],
      total: 0,
      emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.connectedRegions,
    },
  },
}

export const Loading: Story = {
  args: {
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
    connectedRegions: {
      previewItems: [],
      total: 0,
      emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.connectedRegions,
    },
    isError: true,
    errorText: ORGANIZATION_CONNECTED_REGIONS_LOAD_ERROR,
  },
}
