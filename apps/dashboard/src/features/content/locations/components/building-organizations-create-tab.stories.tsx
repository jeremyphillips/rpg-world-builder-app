import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Organization } from '@rpg/contracts'

import { BuildingOrganizationsCreateTab } from './building-organizations-create-tab.client'

const meta = {
  title: 'Features/Locations/Building Organizations Create Tab',
  component: BuildingOrganizationsCreateTab,
  parameters: { layout: 'padded' },
  args: { campaignId: 'storybook-campaign' },
} satisfies Meta<typeof BuildingOrganizationsCreateTab>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {}

export const MixedPendingRelationships: Story = {
  args: {
    organizationItems: [
      {
        id: 'organization-existing',
        name: 'Harbor Merchants Guild',
        organizationDomain: 'commercial',
        activities: [],
        connections: { locations: [] },
      },
    ] as unknown as Organization[],
    initialPlan: {
      organizations: [
        {
          draftOrganizationId: 'organization-new',
          values: {
            name: 'Copper Kettle Cooperative',
            organizationDomain: 'commercial',
            activities: [],
          },
        },
      ],
      relationships: [
        {
          draftId: 'relationship-existing',
          kind: 'owns',
          organization: { kind: 'existing', organizationId: 'organization-existing' },
        },
        {
          draftId: 'relationship-new',
          kind: 'operator',
          organization: { kind: 'new', draftOrganizationId: 'organization-new' },
        },
      ],
    },
  },
}
