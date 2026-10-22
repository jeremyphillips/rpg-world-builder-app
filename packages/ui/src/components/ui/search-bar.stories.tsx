import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { FormSectionProvider } from '../../form/context/form-section.context'
import { FilterChromeProvider } from '../../filters/filter-chrome.context'
import { ClassReferenceTable } from '../../stories/semantic-classes/class-reference-table'
import { comboboxSearchRowVariants } from './combobox-field.variants'
import { fieldControlVariants } from './field-control.variants'
import { FIELD_CONTROL_SIZE_SPECS, resolveSearchBarFieldInputClass } from './field-control.styles'
import { SearchBar } from './search-bar.client'

const meta = {
  title: 'Forms/SearchBar',
  component: SearchBar,
  parameters: {
    semanticClasses: true,
    docs: {
      description: {
        component: '`ui-search-bar` parts and field input inset classes live in field-control.css.',
      },
    },
  },
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

export const ClassReference: Story = {
  tags: ['control-parity'],
  parameters: { semanticClasses: true },
  render: () => (
    <ClassReferenceTable
      rows={FIELD_CONTROL_SIZE_SPECS.map((spec) => ({
        key: spec.size,
        sample: (
          <SearchBar
            id={`search-${spec.size}`}
            size={spec.size}
            ariaLabel="Search demo"
            placeholder="Search…"
            value=""
            onValueChange={() => undefined}
            data-semantic-class-target
          />
        ),
        propsLabel: `size="${spec.size}"`,
        className: `ui-search-bar ${fieldControlVariants({ size: spec.size })} ${resolveSearchBarFieldInputClass(spec.size)}`,
        keyValues: `control height: ${spec.controlHeight}`,
        useCase: spec.useCase,
      }))}
    />
  ),
}
