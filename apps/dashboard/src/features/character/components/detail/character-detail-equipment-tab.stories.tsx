import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  createPopulatedStandaloneBuilderContextFixture,
  createStandaloneBuilderCatalogIndexFixture,
} from '../../lib/character-builder-fixtures'
import { SAMPLE_PC } from '../../lib/character-fixtures'
import { buildCharacterSheetEquipmentCards } from '../../lib/detail/character-sheet-catalog'
import { CharacterDetailEquipmentTab } from './character-detail-equipment-tab.client'

const context = createPopulatedStandaloneBuilderContextFixture()
const catalogIndex = createStandaloneBuilderCatalogIndexFixture(context)
const cards = buildCharacterSheetEquipmentCards(
  {
    ...SAMPLE_PC,
    equipment: {
      ...SAMPLE_PC.equipment,
      weapons: [
        {
          entryId: 'weapon-1',
          equipmentId: 'srd-cc-5.2.1:dagger',
          quantity: 2,
          equipped: true,
          sources: [{ kind: 'manual' }],
        },
      ],
    },
  },
  catalogIndex,
)

const meta = {
  title: 'Character/Detail/CharacterDetailEquipmentTab',
  component: CharacterDetailEquipmentTab,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CharacterDetailEquipmentTab>

export default meta
type Story = StoryObj<typeof meta>

export const WithEquipment: Story = {
  args: {
    cards,
    wealth: { label: 'Wealth', value: '15 gp' },
  },
}

export const Empty: Story = {
  args: {
    cards: [],
    wealth: { label: 'Wealth', value: '0 gp' },
  },
}
