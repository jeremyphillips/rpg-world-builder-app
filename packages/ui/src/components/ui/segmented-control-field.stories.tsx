import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { SegmentedControlField } from './segmented-control-field.client'

const meta = {
  title: 'Components/SegmentedControlField',
  component: SegmentedControlField,
  args: {
    id: 'behavior',
    label: 'Action behavior',
    options: [
      { value: 'one', label: 'Chooses one' },
      { value: 'each', label: 'Uses each' },
    ],
  },
} satisfies Meta<typeof SegmentedControlField>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: function Render(args) {
    const [value, setValue] = useState('one')
    return <SegmentedControlField {...args} value={value} onValueChange={setValue} />
  },
}
