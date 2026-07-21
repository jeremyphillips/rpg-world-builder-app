import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button } from './button.client'

const meta = {
  title: 'Primitives/Button',
  component: Button,
  args: {
    children: 'Button',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'text'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
    density: {
      control: 'select',
      options: ['default', 'compact'],
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Secondary: Story = {
  args: { variant: 'secondary' },
}

export const Destructive: Story = {
  args: { variant: 'destructive' },
}

export const Outline: Story = {
  args: { variant: 'outline' },
}

export const Ghost: Story = {
  args: { variant: 'ghost' },
}

export const Link: Story = {
  args: { variant: 'link' },
}

export const Text: Story = {
  args: { variant: 'text' },
}

export const Small: Story = {
  args: { size: 'sm' },
}

export const SmallCompact: Story = {
  args: { size: 'sm', density: 'compact' },
}

export const Large: Story = {
  args: { size: 'lg' },
}

export const Disabled: Story = {
  args: { disabled: true },
}
