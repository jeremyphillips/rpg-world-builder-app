import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { FormSectionProvider } from '../../form/context/form-section.context'
import { FilterChromeProvider } from '../../filters/filter-chrome.context'
import { comboboxSearchRowVariants } from './combobox-field.variants'
import { SearchBar } from './search-bar.client'

const meta = {
  title: 'Forms/SearchBar',
  component: SearchBar,
  args: {
    id: 'entity-search',
    placeholder: 'Search organizations…',
    ariaLabel: 'Search organizations',
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
      placeholder={args.placeholder}
      ariaLabel={args.ariaLabel ?? 'Search organizations'}
      value={value}
      onValueChange={setValue}
      size={args.size}
      disabled={args.disabled}
      appearance={args.appearance}
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
  render: (args) => <SearchBarDemo {...args} />,
}

export const FilterChromeComfortable: Story = {
  render: (args) => (
    <FilterChromeProvider density="comfortable">
      <SearchBarDemo {...args} />
    </FilterChromeProvider>
  ),
}

export const FormSectionCompact: Story = {
  render: (args) => (
    <FormSectionProvider density="compact">
      <SearchBarDemo {...args} />
    </FormSectionProvider>
  ),
}

function EmbeddedHostDemo(args: NonNullable<Story['args']>) {
  const [value, setValue] = useState(args.value ?? '')
  return (
    <div className="max-w-md border border-border bg-input">
      <div className={comboboxSearchRowVariants({ size: args.size ?? 'md' })}>
        <SearchBar
          appearance="embedded"
          id="embedded-search-demo"
          placeholder={args.placeholder}
          ariaLabel={args.ariaLabel ?? 'Search choices'}
          value={value}
          onValueChange={setValue}
          size={args.size}
        />
      </div>
    </div>
  )
}

export const EmbeddedInHostRow: Story = {
  render: (args) => <EmbeddedHostDemo {...args} />,
  args: {
    ariaLabel: 'Search choices',
    placeholder: 'Search choices…',
    value: 'arc',
  },
}
