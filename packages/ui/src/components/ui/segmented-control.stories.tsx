import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { SegmentedControl } from './segmented-control.client'

const meta = {
  title: 'Components/SegmentedControl',
  component: SegmentedControl,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SegmentedControl>

export default meta
type Story = StoryObj<typeof meta>

export const AutoWidthSegments: Story = {
  args: {
    'aria-label': 'Search filter group',
    value: 'all',
    segmentWidth: 'auto',
    options: [
      { value: 'all', label: 'All' },
      { value: 'characters', label: 'Characters' },
      { value: 'content', label: 'Content' },
      { value: 'game-terms', label: 'Game Terms' },
    ],
    onValueChange: () => undefined,
  },
  render: (args) => {
    const [value, setValue] = useState(args.value)
    return <SegmentedControl {...args} value={value} onValueChange={(next) => setValue(next)} />
  },
}

export const SearchFilterCounts: Story = {
  args: {
    'aria-label': 'Filter results by type',
    value: 'content',
    segmentWidth: 'auto',
    options: [
      { value: 'all', label: 'All', metadata: '24' },
      { value: 'characters', label: 'Characters', metadata: '3' },
      { value: 'content', label: 'Content', metadata: '14' },
      { value: 'game-terms', label: 'Game Terms', metadata: '7' },
    ],
    onValueChange: () => undefined,
  },
  render: (args) => {
    const [value, setValue] = useState(args.value)
    return <SegmentedControl {...args} value={value} onValueChange={(next) => setValue(next)} />
  },
}

export const TwoSegments: Story = {
  args: {
    'aria-label': 'Spell picker mode',
    value: 'cantrips',
    fullWidth: true,
    options: [
      { value: 'cantrips', label: 'Cantrips', metadata: '1/3' },
      { value: 'prepared-spells', label: 'Prepared spells', metadata: '3/4' },
    ],
    onValueChange: () => undefined,
  },
  render: (args) => {
    const [value, setValue] = useState<'cantrips' | 'prepared-spells'>('cantrips')
    return (
      <SegmentedControl
        {...args}
        value={value}
        onValueChange={(next) => setValue(next as 'cantrips' | 'prepared-spells')}
      />
    )
  },
}
