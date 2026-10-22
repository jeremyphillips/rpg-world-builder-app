import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'

import { buildCharacterCardViewModel } from '../lib/display/character-display'
import { CHARACTER_CONTROLLER_DISPLAY } from '../lib/display/character-display-labels'
import {
  createPopulatedStandaloneBuilderContextFixture,
  createStandaloneBuilderCatalogIndexFixture,
} from '../lib/fixtures/character-builder-fixtures'
import { SAMPLE_PC } from '../lib/fixtures/character-fixtures'
import {
  CHARACTER_LIST_CARD_HEADER_COPY_CLASS,
  CHARACTER_LIST_CARD_HEADER_COPY_TEST_ID,
  CharacterListCard,
} from './character-list-card'

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
    detailHref: '/characters/char-sample-1',
  },
}

export const WithCampaign: Story = {
  args: {
    card: {
      ...buildCharacterCardViewModel(SAMPLE_PC, catalogIndex),
      campaign: { id: 'camp-1', name: 'The Argent Road' },
    },
    detailHref: '/campaigns/camp-1/characters/char-sample-1',
  },
}

export const CampaignRoster: Story = {
  args: {
    card: {
      ...buildCharacterCardViewModel(SAMPLE_PC, catalogIndex),
      campaign: { id: 'camp-1', name: 'The Argent Road' },
    },
    detailHref: '/campaigns/camp-1/characters/char-sample-1',
    showCampaign: false,
    controllerLine: CHARACTER_CONTROLLER_DISPLAY.playedBy('Player One'),
    rosterStatus: 'active',
  },
}

export const Unassigned: Story = {
  args: {
    card: buildCharacterCardViewModel(SAMPLE_PC, catalogIndex),
    detailHref: '/campaigns/camp-1/characters/char-sample-1',
    showCampaign: false,
    controllerLine: CHARACTER_CONTROLLER_DISPLAY.noPlayerAssigned,
    rosterStatus: 'inactive',
  },
}

export const PlayedByYou: Story = {
  args: {
    card: buildCharacterCardViewModel(SAMPLE_PC, catalogIndex),
    detailHref: '/campaigns/camp-1/characters/char-sample-1',
    showCampaign: false,
    controllerLine: CHARACTER_CONTROLLER_DISPLAY.playedByYou,
    rosterStatus: 'active',
  },
}

const densityComparisonCard = {
  ...buildCharacterCardViewModel(SAMPLE_PC, catalogIndex),
  campaign: { id: 'camp-1', name: 'The Argent Road' },
}

export const DensityComparison: Story = {
  render: () => (
    <div className="grid max-w-sm gap-4">
      {(['compact', 'comfortable', 'spacious'] as const).map((density) => (
        <CharacterListCard
          key={density}
          density={density}
          card={densityComparisonCard}
          detailHref="/campaigns/camp-1/characters/char-sample-1"
          rosterStatus="active"
          showCampaign={false}
          controllerLine={CHARACTER_CONTROLLER_DISPLAY.playedByYou}
        />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const wrappers = canvasElement.querySelectorAll(
      `[data-testid="${CHARACTER_LIST_CARD_HEADER_COPY_TEST_ID}"]`,
    )
    expect(wrappers.length).toBe(3)
    for (const wrapper of wrappers) {
      for (const className of CHARACTER_LIST_CARD_HEADER_COPY_CLASS.split(' ')) {
        expect(wrapper).toHaveClass(className)
      }
      expect(wrapper.querySelector('.ui-identity-row__stack')).toBeNull()
    }
  },
}
