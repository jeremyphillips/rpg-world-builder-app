import type { Meta, StoryObj } from '@storybook/react-vite'

import { pickEquipment } from '@/features/content'

import {
  createPopulatedStandaloneBuilderContextFixture,
  createStandaloneBuilderCatalogIndexFixture,
} from '../../../lib/fixtures/character-builder-fixtures'
import { SAMPLE_PC } from '../../../lib/fixtures/character-fixtures'
import { buildCharacterSheetEquipmentCards } from '../../../lib/detail/character-sheet-catalog'
import { CharacterDetailEquipmentTab } from './character-detail-equipment-tab.client'

const context = createPopulatedStandaloneBuilderContextFixture()
const catalogIndex = createStandaloneBuilderCatalogIndexFixture(context)
const dagger = pickEquipment('dagger')
const chainMail = pickEquipment('chain-mail')
const cards = buildCharacterSheetEquipmentCards(
  {
    ...SAMPLE_PC,
    equipment: {
      ...SAMPLE_PC.equipment,
      weapons: [
        {
          entryId: 'weapon-1',
          equipmentId: dagger.id,
          quantity: 2,
          equipped: true,
          sources: [{ kind: 'manual' }],
        },
      ],
      armor: [
        {
          entryId: 'armor-1',
          equipmentId: chainMail.id,
          quantity: 1,
          sources: [{ kind: 'manual' }],
        },
      ],
    },
  },
  {
    ...catalogIndex,
    equipment: new Map([...catalogIndex.equipment, [dagger.id, dagger], [chainMail.id, chainMail]]),
  },
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
