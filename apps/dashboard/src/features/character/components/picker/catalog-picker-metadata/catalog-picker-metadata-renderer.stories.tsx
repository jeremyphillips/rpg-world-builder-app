import type { Meta, StoryObj } from '@storybook/react-vite'

import { CatalogPickerMetadataRenderer } from './catalog-picker-metadata-renderer.client'

const meta = {
  title: 'Character Builder/CatalogPickerMetadataRenderer',
  component: CatalogPickerMetadataRenderer,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CatalogPickerMetadataRenderer>

export default meta
type Story = StoryObj<typeof meta>

export const MixedBadgeAndText: Story = {
  args: {
    lines: [
      {
        segments: [
          { type: 'text', text: 'Action' },
          { type: 'text', text: 'Self' },
          {
            type: 'badge',
            text: '1st level',
            tone: 'neutral',
            appearance: 'soft',
          },
          { type: 'text', text: 'Divination' },
        ],
      },
    ],
  },
  decorators: [
    (Story) => (
      <div className="rounded-md bg-surface-muted p-3">
        <Story />
      </div>
    ),
  ],
}

export const MultiLine: Story = {
  args: {
    lines: [
      {
        segments: [
          { type: 'text', text: 'Action' },
          { type: 'text', text: 'Self' },
          { type: 'text', text: 'Concentration, up to 10 minutes' },
        ],
      },
      {
        segments: [
          {
            type: 'badge',
            text: '1st level',
            tone: 'neutral',
            appearance: 'soft',
          },
          { type: 'text', text: 'Divination' },
        ],
      },
    ],
  },
  decorators: MixedBadgeAndText.decorators,
}

export const EquipmentComparisonGroups: Story = {
  args: {
    lines: [
      {
        segments: [
          { type: 'text', text: '1d4 Piercing' },
          { type: 'text', text: 'Finesse · Light · Thrown' },
        ],
      },
    ],
  },
  decorators: MixedBadgeAndText.decorators,
}

export const EmptyLines: Story = {
  args: {
    lines: [{ segments: [] }, { segments: [{ type: 'text', text: '' }] }],
  },
  decorators: MixedBadgeAndText.decorators,
}
