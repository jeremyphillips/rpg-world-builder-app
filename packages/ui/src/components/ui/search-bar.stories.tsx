import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { SearchBar } from './search-bar.client'

const meta = {
  title: 'Forms/SearchBar',
  component: SearchBar,
  args: {
    id: 'entity-search',
    placeholder: 'Search organizations…',
    value: '',
    onValueChange: () => undefined,
  },
} satisfies Meta<typeof SearchBar>

export default meta
type Story = StoryObj<typeof meta>

function SearchBarDemo(args: NonNullable<Story['args']>) {
  const [value, setValue] = useState(args.value ?? '')
  return (
    <SearchBar
      id={args.id ?? 'entity-search'}
      placeholder={args.placeholder ?? 'Search organizations…'}
      value={value}
      onValueChange={setValue}
      size={args.size}
      disabled={args.disabled}
    />
  )
}

export const Empty: Story = {
  render: (args) => <SearchBarDemo {...args} />,
}

export const WithValue: Story = {
  render: (args) => <SearchBarDemo {...args} />,
  args: {
    value: 'Copper Kettle',
  },
}

export const Compact: Story = {
  render: (args) => <SearchBarDemo {...args} />,
  args: {
    size: 'sm',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    value: 'Disabled query',
  },
}
