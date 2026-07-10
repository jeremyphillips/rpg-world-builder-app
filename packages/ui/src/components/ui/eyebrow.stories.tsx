import type { Meta, StoryObj } from '@storybook/react-vite'

import { Eyebrow } from './eyebrow'

const meta = {
  title: 'Typography/Eyebrow',
  component: Eyebrow,
  args: {
    children: 'Section label',
    size: 'sm',
  },
} satisfies Meta<typeof Eyebrow>

export default meta
type Story = StoryObj<typeof meta>

/** Ultra-compact — link preview cards and dense inline chrome. */
export const ExtraSmall: Story = {
  args: {
    size: 'xs',
    children: 'Spell',
  },
}

/** Default — nav section labels, compact metadata. */
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Campaign',
  },
}

/** Larger eyebrow for emphasis contexts. */
export const Medium: Story = {
  args: {
    size: 'md',
    children: 'Campaign',
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <Eyebrow size="xs">Extra-small eyebrow</Eyebrow>
      <Eyebrow size="sm">Small eyebrow</Eyebrow>
      <Eyebrow size="md">Medium eyebrow</Eyebrow>
    </div>
  ),
}

export const Tones: Story = {
  render: () => (
    <div className="space-y-4">
      <Eyebrow size="xs" tone="muted">
        Muted eyebrow
      </Eyebrow>
      <Eyebrow size="xs" tone="foreground">
        Foreground eyebrow
      </Eyebrow>
      <Eyebrow size="xs" tone="primary">
        Primary eyebrow
      </Eyebrow>
    </div>
  ),
}
