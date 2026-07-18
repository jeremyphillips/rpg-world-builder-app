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
    metadataLines: [
      {
        segments: [
          { type: 'text', text: 'Action' },
          { type: 'text', text: 'Self' },
          { type: 'text', text: 'Concentration, up to 10 minutes' },
        ],
      },
      {
        segments: [
          { type: 'badge', text: '1st level', tone: 'neutral', appearance: 'neutral' },
          { type: 'text', text: 'Divination' },
        ],
      },
    ],
    footer: <span className="text-xs text-muted-foreground">Ritual</span>,
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
      <div className="rounded-md bg-surface-muted p-3">
        <Story />
      </div>
    ),
  ],
}
