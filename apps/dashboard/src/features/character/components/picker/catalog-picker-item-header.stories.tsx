import type { Meta, StoryObj } from '@storybook/react-vite'
import { vi } from 'vitest'

import { CatalogPickerItemHeader } from './catalog-picker-item-header.client'
import { CatalogPickerSelectionActions } from './catalog-picker-selection-actions.client'

const meta = {
  title: 'Character Builder/CatalogPickerItemHeader',
  component: CatalogPickerItemHeader,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CatalogPickerItemHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    name: 'Detect Magic',
    metadataLine: 'Level 1 · Divination · Concentration · Ritual',
    footer: <span className="text-xs text-muted-foreground">detection</span>,
    actions: (
      <CatalogPickerSelectionActions
        selected={false}
        canSelect
        onAdd={vi.fn()}
        onRemove={vi.fn()}
      />
    ),
  },
  decorators: [
    (Story) => (
      <div className="rounded-md bg-muted/30 p-3">
        <Story />
      </div>
    ),
  ],
}
