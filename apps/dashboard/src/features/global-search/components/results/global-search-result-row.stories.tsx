import type { GlobalSearchDocument } from '@rpg/contracts'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { SearchResultRow } from './global-search-result-row'

function spellDocument(overrides: Partial<GlobalSearchDocument> = {}): GlobalSearchDocument {
  return {
    id: 'content:spells:fireball',
    filterGroup: 'content',
    typeLabel: 'Spell',
    title: 'Fireball',
    secondary: '3rd-level evocation · Instantaneous',
    target: { kind: 'spell', id: 'fireball' },
    fields: [{ text: 'Fireball', weight: 1, role: 'label' }],
    ...overrides,
  }
}

const meta = {
  title: 'GlobalSearch/SearchResultRow',
  component: SearchResultRow,
  decorators: [
    (Story) => (
      <div className="max-w-xl border border-border">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SearchResultRow>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    document: spellDocument(),
    href: '/campaigns/demo/spells/fireball',
  },
}

export const Character: Story = {
  args: {
    document: {
      id: 'character:pc:aria',
      filterGroup: 'characters',
      typeLabel: 'PC',
      title: 'Aria Nightshade',
      secondary: 'Level 5 wizard · Stormwatch',
      target: { kind: 'character', id: 'aria', characterType: 'pc' },
      fields: [{ text: 'Aria Nightshade', weight: 1, role: 'label' }],
    },
    href: '/campaigns/demo/characters/aria',
  },
}

export const CampaignUnavailable: Story = {
  args: {
    document: spellDocument({
      title: 'Arcane Trickster',
      secondary: 'd8 Hit Die',
      typeLabel: 'Class',
      target: { kind: 'class', id: 'arcane-trickster' },
    }),
    href: '/campaigns/demo/classes/arcane-trickster',
    campaignUnavailable: true,
  },
}

export const LongSecondary: Story = {
  args: {
    document: spellDocument({
      secondary: '3rd-level evocation · Instantaneous · Very long summary that should truncate',
    }),
    href: '/campaigns/demo/spells/fireball',
  },
}
