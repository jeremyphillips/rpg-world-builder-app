import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  createPopulatedStandaloneBuilderContextFixture,
  createStandaloneBuilderCatalogIndexFixture,
} from '../lib/character-builder-fixtures'
import { buildCharacterDetailViewModel } from '../lib/character-display'
import { SAMPLE_PC } from '../lib/character-fixtures'
import { CharacterDetailContent } from './character-detail-content.client'

const context = createPopulatedStandaloneBuilderContextFixture()
const catalogIndex = createStandaloneBuilderCatalogIndexFixture(context)

const meta = {
  title: 'Character/CharacterDetailContent',
  component: CharacterDetailContent,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CharacterDetailContent>

export default meta
type Story = StoryObj<typeof CharacterDetailContent>

export const Default: Story = {
  args: {
    viewModel: buildCharacterDetailViewModel({
      character: SAMPLE_PC,
      catalogIndex,
      rules: context.characterCreationRules,
      xpProgression: { entries: [{ level: 1, xpRequired: 0 }] },
    }),
  },
}
