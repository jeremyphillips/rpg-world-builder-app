import type { Meta, StoryObj } from '@storybook/react-vite'

import { SearchResultRow } from './search-result-row.client'

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
    title: 'Fireball',
    secondary: '3rd-level evocation · Instantaneous',
    typeLabel: 'Spell',
    href: '/campaigns/demo/spells/fireball',
  },
}

export const Character: Story = {
  args: {
    title: 'Aria Nightshade',
    secondary: 'Level 5 wizard · Stormwatch',
    typeLabel: 'Character',
    href: '/campaigns/demo/characters/aria',
  },
}

export const CampaignUnavailable: Story = {
  args: {
    title: 'Arcane Trickster',
    secondary: 'd8 Hit Die',
    typeLabel: 'Class',
    href: '/campaigns/demo/classes/arcane-trickster',
    campaignUnavailable: true,
  },
}

export const PreviewPanel: Story = {
  args: {
    title: 'Fireball',
    secondary: '3rd-level evocation · Instantaneous · Very long summary that should truncate',
    typeLabel: 'Spell',
    href: '/campaigns/demo/spells/fireball',
    inset: 'panel',
  },
}
