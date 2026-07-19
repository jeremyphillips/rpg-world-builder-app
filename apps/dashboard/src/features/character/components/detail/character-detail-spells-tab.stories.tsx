import type { Meta, StoryObj } from '@storybook/react-vite'

import { pickSpell } from '@/features/content/lib/fixtures/pick'

import {
  createPopulatedStandaloneBuilderContextFixture,
  createStandaloneBuilderCatalogIndexFixture,
} from '../../lib/character-builder-fixtures'
import { SAMPLE_PC } from '../../lib/character-fixtures'
import { buildCharacterSheetSpellCards } from '../../lib/detail/character-sheet-catalog'
import { CharacterDetailSpellsTab } from './character-detail-spells-tab.client'

const context = createPopulatedStandaloneBuilderContextFixture()
const baseCatalogIndex = createStandaloneBuilderCatalogIndexFixture(context)
const spell = pickSpell('fire-bolt')
const catalogIndex = {
  ...baseCatalogIndex,
  spells: new Map([...baseCatalogIndex.spells, [spell.id, spell]]),
}
const cards = buildCharacterSheetSpellCards(
  {
    ...SAMPLE_PC,
    spells: [
      {
        spellId: spell.id,
        sources: [
          {
            kind: 'classSpellcasting' as const,
            sourceId: 'srd-cc-5.2.1:wizard',
            grantId: 'cantrips',
          },
        ],
        access: { classKnown: true },
        selection: { prepared: true },
      },
    ],
  },
  catalogIndex,
)

const meta = {
  title: 'Character/Detail/CharacterDetailSpellsTab',
  component: CharacterDetailSpellsTab,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CharacterDetailSpellsTab>

export default meta
type Story = StoryObj<typeof meta>

export const WithSpells: Story = {
  args: { cards },
}

export const Empty: Story = {
  args: { cards: [] },
}
