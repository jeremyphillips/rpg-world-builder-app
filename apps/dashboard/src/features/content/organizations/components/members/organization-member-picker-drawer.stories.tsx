import type { Meta, StoryObj } from '@storybook/react-vite'

import { OrganizationMemberPickerDrawer } from './organization-member-picker-drawer'
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

/** Member badges show title suffix when set; untitled memberships show Member only. */
export const MemberStatusBadges: Story = {}

export const NoCandidates: Story = {
  args: { candidates: [] },
}

/** With the Quick NPC shortcut wired — the footer offers "Create new NPC". */
export const WithQuickNpcCreation: Story = {
  args: {
    quickNpc: {
      enabled: true,
      buildContextReady: true,
    },
    onCreateNpc: () => undefined,
  },
}

/** Build context failed to load — the footer shows a hint instead of the entry action. */
export const QuickNpcCreationUnavailable: Story = {
  args: {
    quickNpc: {
      enabled: true,
      buildContextFailed: true,
      buildContextReady: false,
    },
  },
}
