import type { Meta, StoryObj } from '@storybook/react-vite'
import { useRef, useState } from 'react'

import { FormSectionProvider } from '../../form/context/form-section.context'
import { FilterChromeProvider } from '../../filters/filter-chrome.context'
import { ClassReferenceTable } from '../../stories/semantic-classes/class-reference-table'
import { ComboboxSearchField } from './combobox-field-parts.client'
import { comboboxContentVariants } from './combobox-field.variants'
import { fieldControlVariants } from './field-control.variants'
import { FIELD_CONTROL_SIZE_SPECS, resolveSearchBarFieldInputClass } from './field-control.styles'
import { ListGroupHeading } from './list-group-heading.client'
import { InteractiveList } from './interactive-list.client'
import { InteractiveListRow } from './interactive-list-row.client'
import { POPOVER_INTERACTIVE_LIST_DENSITY } from './list-density.lib'
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

function PopoverToolbarCompositionDemo() {
  const [value, setValue] = useState('fire')
  const searchInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className={comboboxContentVariants()}>
      <ComboboxSearchField
        searchPlaceholder="Search add…"
        listboxId="popover-toolbar-demo-listbox"
        searchId="popover-toolbar-demo-search"
        size="md"
        query={value}
        onQueryChange={setValue}
        searchInputRef={searchInputRef}
      />
      <ListGroupHeading label="Equipped weapons" first />
      <InteractiveList
        density={POPOVER_INTERACTIVE_LIST_DENSITY}
        role="listbox"
        aria-label="Weapons"
      >
        <InteractiveListRow name="Add a weapon to Equipment" />
      </InteractiveList>
      <ListGroupHeading label="Natural attacks" follows="complete" />
      <InteractiveList density={POPOVER_INTERACTIVE_LIST_DENSITY}>
        <InteractiveListRow name="Claw" classification="Slashing" />
        <InteractiveListRow name="Bite" classification="Piercing" />
      </InteractiveList>
    </div>
  )
}

/** Production shape: toolbar-owned inset, embedded search, group bands, compact rows. */
export const PopoverToolbarComposition: Story = {
  render: () => (
    <div className="w-96 overflow-hidden rounded-md border border-border bg-background">
      <PopoverToolbarCompositionDemo />
    </div>
  ),
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
