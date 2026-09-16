import type { Meta, StoryObj } from '@storybook/react-vite'

import { ValidationIssueCountBadge } from './validation-issue-count-badge.client'

const meta = {
  title: 'UI/ValidationIssueCountBadge',
  component: ValidationIssueCountBadge,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ValidationIssueCountBadge>

export default meta
type Story = StoryObj<typeof meta>

export const SingleIssue: Story = {
  args: { count: 1 },
}

export const MultipleIssues: Story = {
  args: { count: 12 },
}
