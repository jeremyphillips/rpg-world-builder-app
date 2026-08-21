import type { Meta, StoryObj } from '@storybook/react-vite'

import { CharacterImportEquipmentPreviewSection } from './character-import-equipment-preview'

const meta = {
  title: 'Dashboard/Character Import/Equipment Preview',
  component: CharacterImportEquipmentPreviewSection,
} satisfies Meta<typeof CharacterImportEquipmentPreviewSection>

export default meta

type Story = StoryObj<typeof meta>

export const MixedCatalogMatches: Story = {
  args: {
    result: {
      status: 'mapped',
      value: [
        {
          sourceValue: 'Backpack',
          sourceLabel: 'Backpack',
          quantity: 2,
          status: 'mapped',
          localValue: 'srd-cc-5.2.1:backpack',
        },
        {
          sourceValue: 'Bag of Tricks',
          sourceLabel: 'Bag of Tricks',
          quantity: 1,
          status: 'unresolved-reference',
        },
        {
          sourceValue: "Assassin's Blood (Ingested)",
          sourceLabel: "Assassin's Blood (Ingested)",
          quantity: 1,
          status: 'unresolved-reference',
        },
      ],
      sourcePaths: ['data.inventory'],
      issues: [],
    },
  },
}
