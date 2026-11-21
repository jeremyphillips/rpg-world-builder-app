import type { Meta, StoryObj } from '@storybook/react-vite'

import { NavigationChevron } from './navigation-chevron.client'

const meta = {
  title: 'UI/NavigationChevron',
  component: NavigationChevron,
  tags: ['autodocs'],
} satisfies Meta<typeof NavigationChevron>

export default meta

type Story = StoryObj<typeof meta>

export const Medium: Story = {
  args: { size: 'md' },
}

export const Large: Story = {
  args: { size: 'lg' },
}
