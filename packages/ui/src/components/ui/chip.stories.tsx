import type { Meta, StoryObj } from '@storybook/react-vite'
import { action } from 'storybook/actions'
import { useState } from 'react'

import { ClassReferenceTable } from '../../stories/semantic-classes/class-reference-table'
import { Chip } from './chip.client'
import { ChipGroup } from './chip-group.client'

const CHIP_CLASS_SPECS = [
  {
    key: 'chip / selectable / unselected / md',
    className: 'ui-pill ui-chip--interactive ui-focus-ring',
    keyValues: 'interactive base; hover uses control-hover',
    useCase: 'ChipsField toggle (off)',
  },
  {
    key: 'chip / selectable / selected / md',
    className: 'ui-pill ui-chip--interactive ui-chip--selected ui-focus-ring',
    keyValues: 'selected-control fill',
    useCase: 'ChipsField toggle (on)',
  },
  {
    key: 'chip / removable / neutral soft / md',
    className: 'ui-pill ui-chip--removable ui-border--default',
    keyValues: 'removable padding-end; dismiss is __remove',
    useCase: 'Combobox selected value',
  },
] as const

const meta = {
  title: 'Components/Chip',
  component: Chip,
  parameters: { layout: 'centered', semanticClasses: true },
  args: {
    mode: 'selectable',
    selected: false,
    onSelectedChange: action('onSelectedChange'),
    children: 'Chip',
  },
} satisfies Meta<typeof Chip>

export default meta
type Story = StoryObj<typeof meta>

export const SelectableUnselected: Story = {
  args: {
    mode: 'selectable',
    selected: false,
    children: 'Option',
  },
  render: () => {
    const [selected, setSelected] = useState(false)
    return (
      <Chip mode="selectable" selected={selected} onSelectedChange={setSelected}>
        Option
      </Chip>
    )
  },
}

export const SelectableSelected: Story = {
  args: {
    mode: 'selectable',
    selected: true,
    children: 'Selected',
  },
  render: () => {
    const [selected, setSelected] = useState(true)
    return (
      <Chip mode="selectable" selected={selected} onSelectedChange={setSelected}>
        Selected
      </Chip>
    )
  },
}

export const RemovableXs: Story = {
  args: {
    mode: 'removable',
    size: 'xs',
    removeLabel: 'Remove Dart',
    onRemove: action('onRemove'),
    children: 'Dart',
  },
}

export const RemovableSm: Story = {
  args: {
    mode: 'removable',
    size: 'sm',
    removeLabel: 'Remove Club',
    onRemove: action('onRemove'),
    children: 'Club',
  },
}

export const RemovableMd: Story = {
  args: {
    mode: 'removable',
    size: 'md',
    removeLabel: 'Remove Dagger',
    onRemove: action('onRemove'),
    children: 'Dagger',
  },
}

export const RemovableLg: Story = {
  args: {
    mode: 'removable',
    size: 'lg',
    removeLabel: 'Remove Rapier',
    onRemove: action('onRemove'),
    children: 'Rapier',
  },
}

export const RemovableDisabled: Story = {
  args: {
    mode: 'removable',
    size: 'md',
    disabled: true,
    removeLabel: 'Remove Dagger',
    onRemove: action('onRemove'),
    children: 'Dagger',
  },
}

function ChipSurfaceRow({ surface }: { surface: 'base' | 'subtle' }) {
  const surfaceClass = surface === 'subtle' ? 'bg-surface-muted' : 'bg-background'
  const [selected, setSelected] = useState(true)

  return (
    <ChipGroup className={`rounded-lg p-4 ${surfaceClass}`}>
      <Chip mode="selectable" selected={false} onSelectedChange={() => undefined}>
        Unselected
      </Chip>
      <Chip mode="selectable" selected={selected} onSelectedChange={setSelected}>
        Selected
      </Chip>
      <Chip mode="removable" size="md" removeLabel="Remove value" onRemove={() => undefined}>
        Removable
      </Chip>
      <Chip mode="selectable" selected={false} onSelectedChange={() => undefined} disabled>
        Disabled
      </Chip>
    </ChipGroup>
  )
}

export const ContrastMatrixBase: Story = {
  name: 'Contrast matrix / base surface',
  args: { mode: 'selectable', selected: false, children: 'Matrix' },
  render: () => <ChipSurfaceRow surface="base" />,
}

export const ContrastMatrixSubtle: Story = {
  name: 'Contrast matrix / subtle surface',
  args: { mode: 'selectable', selected: false, children: 'Matrix' },
  render: () => <ChipSurfaceRow surface="subtle" />,
}

export const ClassReference: Story = {
  tags: ['control-parity'],
  parameters: { semanticClasses: true },
  render: () => (
    <ClassReferenceTable
      rows={CHIP_CLASS_SPECS.map((spec) => ({
        key: spec.key,
        sample: spec.key.includes('removable') ? (
          <Chip
            data-semantic-class-target
            mode="removable"
            size="md"
            removeLabel="Remove tag"
            onRemove={() => undefined}
          >
            Tag
          </Chip>
        ) : (
          <span data-semantic-class-target className={spec.className}>
            {spec.useCase}
          </span>
        ),
        propsLabel: spec.key,
        className: spec.className,
        keyValues: spec.keyValues,
        useCase: spec.useCase,
      }))}
    />
  ),
}
