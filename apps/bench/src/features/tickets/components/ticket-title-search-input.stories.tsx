import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { TicketTitleSearchInput } from './ticket-title-search-input'

const meta = {
  title: 'Bench/TicketTitleSearchInput',
  component: TicketTitleSearchInput,
  args: {
    value: '',
    onValueChange: () => undefined,
  },
} satisfies Meta<typeof TicketTitleSearchInput>

export default meta
type Story = StoryObj<typeof meta>

function StatefulSearchInput(
  props: Omit<ComponentProps<typeof TicketTitleSearchInput>, 'value' | 'onValueChange'>,
) {
  const [value, setValue] = useState('')
  return <TicketTitleSearchInput {...props} value={value} onValueChange={setValue} />
}

export const WithLabel: Story = {
  args: {
    label: 'Search',
  },
  render: (args) => <StatefulSearchInput {...args} />,
}

export const CompactToolbar: Story = {
  args: {
    compact: true,
  },
  render: (args) => <StatefulSearchInput {...args} />,
}
