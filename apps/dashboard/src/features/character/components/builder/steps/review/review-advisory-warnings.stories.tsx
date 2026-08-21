import type { Meta, StoryObj } from '@storybook/react-vite'

import { ReviewAdvisoryWarnings } from './review-advisory-warnings.client'

const meta = {
  title: 'Character Builder/ReviewAdvisoryWarnings',
  component: ReviewAdvisoryWarnings,
} satisfies Meta<typeof ReviewAdvisoryWarnings>

export default meta
type Story = StoryObj<typeof ReviewAdvisoryWarnings>

export const WithWarnings: Story = {
  args: {
    warnings: ['Name is not set.', 'Class is not selected.'],
  },
}

export const Empty: Story = {
  args: {
    warnings: [],
  },
}
