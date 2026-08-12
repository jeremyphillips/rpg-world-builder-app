import type { Meta, StoryObj } from '@storybook/react-vite'

import { CreateSetupSummary } from './create-setup-summary.client'

const meta = {
  title: 'Create Setup/CreateSetupSummary',
  component: CreateSetupSummary,
  args: {
    eyebrow: 'Setup',
    summary: 'House · Residence',
    onChange: () => undefined,
  },
} satisfies Meta<typeof CreateSetupSummary>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const SingleSelection: Story = {
  args: {
    eyebrow: 'Settlement type',
    summary: 'City',
  },
}
