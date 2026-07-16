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
