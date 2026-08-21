import type { Meta, StoryObj } from '@storybook/react-vite'
import { establishSurfaceCurrent } from '@rpg/ui'

import { globalSearchPageResultsShellClasses } from '../../lib/global-search-surface.variants'
import type { GlobalSearchGroupSection as GlobalSearchGroupSectionModel } from '../../lib/rank-global-search'
import { GlobalSearchGroupSection } from './global-search-group-section.client'

const truncatedSection: GlobalSearchGroupSectionModel = {
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

const completeSection: GlobalSearchGroupSectionModel = {
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
  title: 'GlobalSearch/GlobalSearchGroupSection',
  component: GlobalSearchGroupSection,
} satisfies Meta<typeof GlobalSearchGroupSection>

export default meta
type Story = StoryObj<typeof meta>

export const PageContext: Story = {
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-4xl">
        <div className={globalSearchPageResultsShellClasses}>
          <Story />
        </div>
      </div>
    ),
  ],
  args: {
    section: truncatedSection,
    sectionIndex: 0,
    sections: [truncatedSection],
    resolveHref: () => '/campaigns/demo/spells/fireball',
    showAllHref: () => '/campaigns/demo/search?group=content',
  },
}

export const PanelContext: Story = {
  decorators: [
    (Story) => (
      <div
        className={`w-96 border border-border bg-surface-subtle ${establishSurfaceCurrent('surface-subtle')}`}
      >
        <Story />
      </div>
    ),
  ],
  args: {
    ...PageContext.args,
    rowDensity: 'compact',
    surfaceContext: 'preview',
  },
}

export const CompleteAfterTruncated: Story = {
  ...PanelContext,
  args: {
    section: completeSection,
    sectionIndex: 1,
    sections: [truncatedSection, completeSection],
    resolveHref: () => '/campaigns/demo/game-terms/darkvision',
    showAllHref: () => '/campaigns/demo/search?group=game-terms',
    rowDensity: 'compact',
    surfaceContext: 'preview',
  },
}
