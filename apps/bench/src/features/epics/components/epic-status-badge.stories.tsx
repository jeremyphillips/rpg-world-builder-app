import type { Meta, StoryObj } from '@storybook/react-vite'

import { EpicStatusBadge } from './epic-status-badge'

const meta = {
  title: 'Bench/Epics/EpicStatusBadge',
  component: EpicStatusBadge,
} satisfies Meta<typeof EpicStatusBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Active: Story = { args: { status: 'active' } }
export const Paused: Story = { args: { status: 'paused' } }
export const Done: Story = { args: { status: 'done' } }
