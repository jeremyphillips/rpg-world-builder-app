import type { Meta, StoryObj } from '@storybook/react-vite'

import { makeOrganization } from '@/test/fixtures/factories/organization'

import { OrganizationMembershipTitlesDetailSection } from './organization-membership-titles-detail-section'

const meta = {
  title: 'Content/Organizations/OrganizationMembershipTitlesDetailSection',
  component: OrganizationMembershipTitlesDetailSection,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof OrganizationMembershipTitlesDetailSection>

export default meta
type Story = StoryObj<typeof meta>

export const WithCatalog: Story = {
  args: {
    organization: makeOrganization(),
  },
}

export const EmptyCatalog: Story = {
  args: {
    organization: makeOrganization({
      members: { classAffinityIds: [], speciesAffinityIds: [], titles: [] },
    }),
  },
}
