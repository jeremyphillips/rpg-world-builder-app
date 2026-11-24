import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  createPopulatedStandaloneBuilderContextFixture,
  createStandaloneBuilderCatalogIndexFixture,
  standaloneEquipmentReferenceScope,
} from '../../lib/fixtures/character-builder-fixtures'
import {
  buildCharacterDetailViewModel,
  toCharacterDetailSource,
} from '../../lib/display/character-display'
import { makePcCharacter } from '../../lib/fixtures/character-fixtures'
import { CharacterDetailSheet } from './character-detail-sheet'

const context = createPopulatedStandaloneBuilderContextFixture()
const catalogIndex = createStandaloneBuilderCatalogIndexFixture(context)

const meta = {
  title: 'Character/CharacterDetailSheet',
  component: CharacterDetailSheet,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CharacterDetailSheet>

export default meta
type Story = StoryObj<typeof CharacterDetailSheet>

export const Default: Story = {
  args: {
    viewModel: buildCharacterDetailViewModel({
      source: toCharacterDetailSource(makePcCharacter()),
      catalogIndex,
      rules: context.characterCreationRules,
      equipmentReferenceScope: standaloneEquipmentReferenceScope,
      xpProgression: { entries: [{ level: 1, xpRequired: 0 }] },
    }),
  },
}
