import type { Meta, StoryObj } from '@storybook/react-vite'

import { ORGANIZATION_EMPTY_SECTION_TEXT } from '../lib/organization-display'
import {
  ORGANIZATION_LOCATION_CONNECTIONS_LOAD_ERROR,
  OrganizationLocationConnectionsSection,
} from './organization-location-connections-section.client'

const meta = {
  title: 'Content/Organizations/OrganizationLocationConnectionsSection',
  component: OrganizationLocationConnectionsSection,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof OrganizationLocationConnectionsSection>

export default meta
type Story = StoryObj<typeof OrganizationLocationConnectionsSection>

const sampleLocationConnections = {
  previewItems: [
    {
      connectionId: 'conn-1',
      locationId: 'region-1',
      kind: 'governs' as const,
      family: 'territorial_authority' as const,
      familyLabel: 'Territorial authority',
      relationshipLabel: 'Governs',
      card: {
        id: 'region-1',
        name: 'Grey Coast',
        summary: 'Territorial authority · Governs',
      },
      detailHref: '/campaigns/camp-1/locations/region-1',
      locationUnavailable: false,
    },
  ],
  total: 1,
  emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.locationConnections,
}

export const WithConnections: Story = {
  args: {
    locationConnections: sampleLocationConnections,
    canManage: true,
    showEmptySection: true,
    visibleFamilies: ['territorial_authority', 'site'],
    canAddToFamily: { territorial_authority: true, site: true },
  },
}

export const ManagerEmptySiteFamily: Story = {
  args: {
    locationConnections: {
      previewItems: [],
      total: 0,
      emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.locationConnections,
    },
    canManage: true,
    showEmptySection: true,
    visibleFamilies: ['site'],
    canAddToFamily: { site: true },
  },
}

export const PopulatedWithoutAdd: Story = {
  args: {
    locationConnections: sampleLocationConnections,
    canManage: true,
    showEmptySection: true,
    visibleFamilies: ['territorial_authority'],
    canAddToFamily: { territorial_authority: false },
  },
}

export const Error: Story = {
  args: {
    locationConnections: sampleLocationConnections,
    isError: true,
    errorText: ORGANIZATION_LOCATION_CONNECTIONS_LOAD_ERROR,
  },
}
