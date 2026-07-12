import type { Meta, StoryObj } from '@storybook/react-vite'
import { action } from 'storybook/actions'
import { useState } from 'react'

import { Chip } from './chip.client'
import { ChipGroup } from './chip-group.client'

const meta = {
  title: 'Components/Chip',
  component: Chip,
  parameters: { layout: 'centered' },
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

function ChipSurfaceRow({ surface }: { surface: 'base' | 'subtle' }) {
  const surfaceClass = surface === 'subtle' ? 'bg-muted/30' : 'bg-background'
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
