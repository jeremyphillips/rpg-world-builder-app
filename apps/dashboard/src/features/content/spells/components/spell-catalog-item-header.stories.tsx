import type { Meta, StoryObj } from '@storybook/react-vite'

import { SpellCatalogItemHeader } from './spell-catalog-item-header.client'

const meta = {
  title: 'Content/Spells/SpellCatalogItemHeader',
  component: SpellCatalogItemHeader,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SpellCatalogItemHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    name: 'Fire Bolt',
    metadataLines: [
      {
        segments: [
          { type: 'text', text: 'Cantrip' },
          { type: 'text', text: 'Evocation' },
        ],
      },
    ],
    markers: ['Concentration'],
    footer: <span className="text-sm text-muted-foreground">Prepared</span>,
    actions: <button type="button">Remove</button>,
  },
}
