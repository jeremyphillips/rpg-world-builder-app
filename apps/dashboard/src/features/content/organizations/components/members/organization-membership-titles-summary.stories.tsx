import type { Meta, StoryObj } from '@storybook/react-vite'
import type { OrganizationMembershipTitleDefinition } from '@rpg/contracts'

import { OrganizationMembershipTitlesSummary } from './organization-membership-titles-summary'

const populatedTitles: OrganizationMembershipTitleDefinition[] = [
  { id: 'omt_1', label: 'Guildmaster', priority: 50 },
  { id: 'omt_2', label: 'Captain', priority: 40 },
  { id: 'omt_3', label: 'Member', priority: 20 },
  { id: 'omt_4', label: 'Initiate', priority: 10 },
]

const meta = {
  title: 'Content/Organizations/OrganizationMembershipTitlesSummary',
  component: OrganizationMembershipTitlesSummary,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof OrganizationMembershipTitlesSummary>

export default meta
type Story = StoryObj<typeof meta>

export const Populated: Story = {
  args: { titles: populatedTitles },
}

export const EqualPriorityTie: Story = {
  args: {
    titles: [
      { id: 'omt_a', label: 'Speaker', priority: 30 },
      { id: 'omt_b', label: 'Deputy', priority: 30 },
    ],
  },
}

export const Empty: Story = {
  args: { titles: [] },
}
