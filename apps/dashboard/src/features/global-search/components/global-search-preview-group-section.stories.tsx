import type { Meta, StoryObj } from '@storybook/react-vite'

import type { GlobalSearchGroupSection } from '../lib/rank-global-search'
import { GlobalSearchPreviewGroupSection } from './global-search-preview-group-section.client'

const truncatedSection: GlobalSearchGroupSection = {
  filterGroup: 'content',
  totalCount: 14,
  items: [
    {
      id: 'fireball',
      filterGroup: 'content',
      typeLabel: 'Spell',
      title: 'Fireball',
      secondary: '3rd-level evocation · Instantaneous',
      target: { kind: 'spell', id: 'fireball' },
      fields: [{ text: 'Fireball', weight: 1, role: 'label' }],
    },
  ],
}

const completeSection: GlobalSearchGroupSection = {
  filterGroup: 'game-terms',
  totalCount: 2,
  items: [
    {
      id: 'darkvision',
      filterGroup: 'game-terms',
      typeLabel: 'Game Term',
      title: 'Darkvision',
      secondary: 'Senses',
      target: { kind: 'game-term', setId: 'senses', termId: 'darkvision' },
      fields: [{ text: 'Darkvision', weight: 1, role: 'label' }],
    },
    {
      id: 'truesight',
      filterGroup: 'game-terms',
      typeLabel: 'Game Term',
      title: 'Truesight',
      secondary: 'Senses',
      target: { kind: 'game-term', setId: 'senses', termId: 'truesight' },
      fields: [{ text: 'Truesight', weight: 1, role: 'label' }],
    },
  ],
}

const meta = {
  title: 'GlobalSearch/GlobalSearchPreviewGroupSection',
  component: GlobalSearchPreviewGroupSection,
  decorators: [
    (Story) => (
      <div className="w-96 border border-border bg-surface-subtle">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlobalSearchPreviewGroupSection>

export default meta
type Story = StoryObj<typeof meta>

export const Truncated: Story = {
  args: {
    section: truncatedSection,
    sectionIndex: 0,
    sections: [truncatedSection],
    resolveHref: () => '/campaigns/demo/spells/fireball',
    showAllHref: () => '/campaigns/demo/search?group=content',
  },
}

export const CompleteAfterTruncated: Story = {
  args: {
    section: completeSection,
    sectionIndex: 1,
    sections: [truncatedSection, completeSection],
    resolveHref: () => '/campaigns/demo/game-terms/darkvision',
    showAllHref: () => '/campaigns/demo/search?group=game-terms',
  },
}
