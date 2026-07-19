import type { Meta, StoryObj } from '@storybook/react-vite'

import { buildCharacterCardViewModel } from '../lib/character-display'
import {
  createPopulatedStandaloneBuilderContextFixture,
  createStandaloneBuilderCatalogIndexFixture,
} from '../lib/character-builder-fixtures'
import { SAMPLE_PC } from '../lib/character-fixtures'
import { CharacterListCard } from './character-list-card.client'

const catalogIndex = createStandaloneBuilderCatalogIndexFixture(
  createPopulatedStandaloneBuilderContextFixture(),
)

const meta = {
  title: 'Character/CharacterListCard',
  component: CharacterListCard,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CharacterListCard>

export default meta
type Story = StoryObj<typeof CharacterListCard>

export const Default: Story = {
  args: {
    card: buildCharacterCardViewModel(SAMPLE_PC, catalogIndex),
  },
}
