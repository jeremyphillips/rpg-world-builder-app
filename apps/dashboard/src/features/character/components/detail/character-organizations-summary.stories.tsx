import type { Meta, StoryObj } from '@storybook/react-vite'

import { CITY_COUNCIL } from '@/features/content/organizations/fixtures'

import { UNAVAILABLE_ORGANIZATION_LABEL } from '../../lib/display/character-display'
import { CharacterOrganizationsSummary } from './character-organizations-summary.client'

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
    organizationReferences: [
      {
        organizationId: CITY_COUNCIL.id,
        organization: CITY_COUNCIL,
      },
    ],
  },
}

export const WithUnavailableOrganization: Story = {
  args: {
    campaignId: 'camp-1',
    organizationReferences: [
      {
        organizationId: 'org-missing',
        organization: null,
      },
    ],
  },
  render: (args) => (
    <>
      <CharacterOrganizationsSummary {...args} />
      <p className="mt-4 text-sm text-muted-foreground">
        Unavailable label: {UNAVAILABLE_ORGANIZATION_LABEL}
      </p>
    </>
  ),
}
