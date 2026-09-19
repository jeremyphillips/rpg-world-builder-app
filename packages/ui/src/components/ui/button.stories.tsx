import type { Meta, StoryObj } from '@storybook/react-vite'
import { ArrowRight, Plus } from 'lucide-react'

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
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'text'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon', 'icon-lg'],
    },
    density: {
      control: 'select',
      options: ['default', 'compact'],
    },
    tone: {
      control: 'select',
      options: ['accent', 'neutral', 'danger'],
      if: { arg: 'variant', eq: 'text' },
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

export const TextNeutral: Story = {
  args: { variant: 'text', children: 'Change package' },
}

export const TextAccent: Story = {
  args: { variant: 'text', tone: 'accent', children: 'Choose class →' },
}

export const TextDanger: Story = {
  args: { variant: 'text', tone: 'danger', children: 'Delete draft' },
}

export const TextCompactAdd: Story = {
  render: () => (
    <Button variant="text" density="compact">
      <Plus aria-hidden />
      Add relationship
    </Button>
  ),
}

export const TextAccentWithIcon: Story = {
  render: () => (
    <Button variant="text" tone="accent">
      Choose class
      <ArrowRight aria-hidden />
    </Button>
  ),
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

export const IconLarge: Story = {
  render: () => (
    <Button size="icon-lg" aria-label="Large icon action">
      +
    </Button>
  ),
}

export const Disabled: Story = {
  args: { disabled: true },
}
