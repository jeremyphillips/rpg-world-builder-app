import type { Meta, StoryObj } from '@storybook/react-vite'

import { CITY_COUNCIL } from '@/features/content'

import { CharacterOrganizationsSummary } from './character-organizations-summary'

const meta = {
  title: 'Character/CharacterOrganizationsSummary',
  component: CharacterOrganizationsSummary,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CharacterOrganizationsSummary>

export default meta
type Story = StoryObj<typeof CharacterOrganizationsSummary>

export const WithLinks: Story = {
  args: {
    campaignId: 'camp-1',
    memberships: [
      {
        organizationId: CITY_COUNCIL.id,
        title: 'Councillor',
        organization: CITY_COUNCIL,
      },
    ],
  },
}

export const EmptyEditable: Story = {
  args: {
    campaignId: 'camp-1',
    memberships: [],
    canEdit: true,
    onAddOrganization: () => undefined,
  },
}

export const WithUnavailableOrganization: Story = {
  args: {
    campaignId: 'camp-1',
    canEdit: true,
    memberships: [
      {
        organizationId: 'org-missing',
        organization: null,
      },
    ],
    onRemoveUnresolvedMembership: () => undefined,
  },
}
