import type { Meta, StoryObj } from '@storybook/react-vite'

import { buildCharacterCardViewModel } from '../lib/display/character-display'
import { CHARACTER_CONTROLLER_DISPLAY } from '../lib/display/character-display-labels'
import {
  createPopulatedStandaloneBuilderContextFixture,
  createStandaloneBuilderCatalogIndexFixture,
} from '../lib/character-builder-fixtures'
import { SAMPLE_PC } from '../lib/character-fixtures'
import { CharacterListCard } from './character-list-card.client'
import { CharacterListCardPreview } from './character-list-card-preview.client'

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

export const Preview: StoryObj<typeof CharacterListCardPreview> = {
  render: (args) => <CharacterListCardPreview {...args} />,
  args: {
    items: [
      {
        card: buildCharacterCardViewModel(SAMPLE_PC, catalogIndex),
        detailHref: '/characters/char-sample-1',
      },
      {
        card: {
          id: 'char-2',
          name: 'Circle Envoy',
          summary: 'Human · Level 3 Rogue',
        },
        detailHref: '/campaigns/camp-1/npcs/char-2',
      },
    ],
    total: 5,
  },
}
