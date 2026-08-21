import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { CatalogPickerSelectionActions } from './catalog-picker-selection-actions.client'

const meta = {
  title: 'Primitives/CatalogPickerSelectionActions',
  component: CatalogPickerSelectionActions,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof CatalogPickerSelectionActions>

export default meta
type Story = StoryObj<typeof meta>

export const Add: Story = {
  args: {
    phase: 'add',
    canSelect: true,
    onAdd: () => undefined,
    onRemove: () => undefined,
  },
}

export const Remove: Story = {
  args: {
    phase: 'remove',
    onAdd: () => undefined,
    onRemove: () => undefined,
  },
}

export const Pending: Story = {
  args: {
    phase: 'pending',
    onAdd: () => undefined,
    onRemove: () => undefined,
  },
}

export const Success: Story = {
  args: {
    phase: 'success',
    onAdd: () => undefined,
    onRemove: () => undefined,
  },
}

export const Interactive: Story = {
  args: {
    phase: 'add',
    onAdd: () => undefined,
    onRemove: () => undefined,
  },
  render: (args) => {
    const [phase, setPhase] = useState<'add' | 'remove' | 'pending' | 'success'>('add')

    return (
      <CatalogPickerSelectionActions
        {...args}
        phase={phase}
        onAdd={() => {
          setPhase('pending')
          window.setTimeout(() => setPhase('success'), 600)
        }}
        onRemove={() => setPhase('add')}
      />
    )
  },
}
