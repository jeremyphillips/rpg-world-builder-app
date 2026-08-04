import type { Meta, StoryObj } from '@storybook/react-vite'

import { pickSpell } from '@/features/content'

import {
  createPopulatedStandaloneBuilderContextFixture,
  createStandaloneBuilderCatalogIndexFixture,
} from '../../lib/character-builder-fixtures'
import { SAMPLE_PC } from '../../lib/character-fixtures'
import { buildCharacterSheetSpellCards } from '../../lib/detail/character-sheet-catalog'
import { CharacterDetailSpellsTab } from './character-detail-spells-tab.client'

const context = createPopulatedStandaloneBuilderContextFixture()
const baseCatalogIndex = createStandaloneBuilderCatalogIndexFixture(context)
const cantrip = pickSpell('fire-bolt')
const firstLevel = pickSpell('magic-missile')
const catalogIndex = {
  ...baseCatalogIndex,
  spells: new Map([...baseCatalogIndex.spells, [cantrip.id, cantrip], [firstLevel.id, firstLevel]]),
}
const cards = buildCharacterSheetSpellCards(
  {
    ...SAMPLE_PC,
    spells: [
      {
        spellId: cantrip.id,
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
      {
        spellId: firstLevel.id,
        sources: [
          {
            kind: 'classSpellcasting' as const,
            sourceId: 'srd-cc-5.2.1:wizard',
            grantId: 'prepared',
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
