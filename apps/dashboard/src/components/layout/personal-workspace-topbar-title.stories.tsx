import type { Meta, StoryObj } from '@storybook/react-vite'

import { PersonalWorkspaceTopbarTitle } from './personal-workspace-topbar-title'

const meta = {
  title: 'Layout/PersonalWorkspaceTopbarTitle',
  component: PersonalWorkspaceTopbarTitle,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PersonalWorkspaceTopbarTitle>

export default meta

type Story = StoryObj<typeof PersonalWorkspaceTopbarTitle>

export const Default: Story = {}
