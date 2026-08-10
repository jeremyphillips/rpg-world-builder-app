import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '@/features/character'

import { OrganizationMemberPickerDrawer } from './organization-member-picker-drawer.client'
import {
  ORGANIZATION_MEMBER_PICKER_CANDIDATES,
  ORGANIZATION_MEMBER_PICKER_ORGANIZATION,
} from './organization-member-picker-drawer.fixtures'

const meta = {
  title: 'Content/Organizations/OrganizationMemberPickerDrawer',
  component: OrganizationMemberPickerDrawer,
  parameters: { layout: 'fullscreen' },
  args: {
    open: true,
    onOpenChange: () => undefined,
    organization: ORGANIZATION_MEMBER_PICKER_ORGANIZATION,
    candidates: ORGANIZATION_MEMBER_PICKER_CANDIDATES,
    onAdd: async () => undefined,
  },
} satisfies Meta<typeof OrganizationMemberPickerDrawer>

export default meta
type Story = StoryObj<typeof OrganizationMemberPickerDrawer>

export const Default: Story = {}

export const NoCandidates: Story = {
  args: { candidates: [] },
}

/** With the Quick NPC shortcut wired — the footer offers "Create new NPC". */
export const WithQuickNpcCreation: Story = {
  args: {
    quickNpc: {
      campaignId: 'campaign-test-1',
      buildContext: createCampaignNpcBuilderContextFixture({ catalog: populatedBuilderCatalog }),
      onCreated: () => undefined,
    },
  },
}
