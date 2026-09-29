import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Heading } from '@rpg/ui'

import { PageChromeActionsProvider } from '@/components/layout/page-chrome/page-chrome-actions-provider'
import { withDashboardProviders } from '../../../../../../../.storybook/decorators'
import { ContentDetailLayout } from '../content-detail-layout'

const meta = {
  title: 'Content/ContentDetailLayout',
  component: ContentDetailLayout,
  parameters: { layout: 'padded' },
  decorators: [
    withDashboardProviders,
    (Story) => (
      <PageChromeActionsProvider>
        <Story />
      </PageChromeActionsProvider>
    ),
  ],
} satisfies Meta<typeof ContentDetailLayout>

export default meta
type Story = StoryObj<typeof meta>

const PLACEHOLDER_DISPLAY_IMAGE = {
  src: 'https://placehold.co/400x500/1e293b/94a3b8?text=Class+Art',
  role: 'primary' as const,
  sourceKind: 'upload' as const,
}

const FIGHTER_STAT_ROWS = [
  { label: 'Hit Die', value: 'd10 per level' },
  { label: 'Primary Abilities', value: 'Strength, Dexterity' },
  { label: 'Saving Throws', value: 'Strength, Constitution' },
  { label: 'Armor', value: 'All armor, shields' },
]

export const Default: Story = {
  args: {
    contentTypeKey: 'classes',
    name: 'Fighter',
    displayImage: PLACEHOLDER_DISPLAY_IMAGE,
    imageName: 'Fighter',
    statRows: FIGHTER_STAT_ROWS,
    descriptionHtml:
      '<p>A master of martial combat, skilled with a variety of weapons and armor.</p>',
    children: (
      <section aria-labelledby="features-heading">
        <Heading variant="section" as="h2" id="features-heading" className="mb-4">
          Class Features
        </Heading>
        <p>Second Wind, Action Surge</p>
      </section>
    ),
  },
}

export const WithActions: Story = {
  args: {
    contentTypeKey: 'classes',
    name: 'Wizard',
    displayImage: PLACEHOLDER_DISPLAY_IMAGE,
    imageName: 'Wizard',
    campaignId: 'c1',
    editHref: '/campaigns/c1/classes/wizard/edit',
    statRows: [{ label: 'Hit Die', value: 'd6 per level' }],
    actions: (
      <Button variant="outline" size="sm">
        Duplicate
      </Button>
    ),
    descriptionHtml:
      '<p>A scholarly magic-user capable of manipulating the structures of reality.</p>',
  },
}

export const HeroOnly: Story = {
  args: {
    contentTypeKey: 'equipment',
    name: 'Shield',
    displayImage: PLACEHOLDER_DISPLAY_IMAGE,
    imageName: 'Shield',
    statRows: [{ label: 'AC', value: '+2' }],
  },
}

export const SemanticFallback: Story = {
  args: {
    contentTypeKey: 'equipment',
    name: 'Custom Item',
    displayFallback: 'equipment',
    imageName: 'Custom Item',
    statRows: [{ label: 'Type', value: 'Adventuring gear' }],
  },
}

const MANY_STAT_ROWS = [
  { label: 'Hit Die', value: 'd10 per level' },
  { label: 'Primary Abilities', value: 'Strength, Dexterity' },
  { label: 'Saving Throws', value: 'Strength, Constitution' },
  { label: 'Armor', value: 'All armor, shields' },
  { label: 'Weapons', value: 'Simple and martial' },
  { label: 'Tools', value: 'None' },
]

export const HeroMetadataWide: Story = {
  name: 'Hero metadata / wide',
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-6xl p-8">
        <Story />
      </div>
    ),
  ],
  args: {
    contentTypeKey: 'classes',
    name: 'Fighter',
    displayImage: PLACEHOLDER_DISPLAY_IMAGE,
    imageName: 'Fighter',
    statRows: MANY_STAT_ROWS,
    descriptionHtml: '<p>Wide hero with several metadata groups beside artwork.</p>',
  },
}

export const HeroMetadataConstrained: Story = {
  name: 'Hero metadata / constrained width',
  decorators: [
    (Story) => (
      <div className="w-[22rem] max-w-full border border-dashed border-border-subtle p-4">
        <Story />
      </div>
    ),
  ],
  args: {
    contentTypeKey: 'classes',
    name: 'Fighter',
    pageShell: false,
    imageName: 'Fighter',
    statRows: MANY_STAT_ROWS,
    descriptionHtml: '<p>Narrow column forces metadata groups to wrap.</p>',
  },
}

export const HeroMetadataLongLabels: Story = {
  name: 'Hero metadata / long labels and values',
  args: {
    contentTypeKey: 'species',
    name: 'Custom ancestry',
    displayImage: PLACEHOLDER_DISPLAY_IMAGE,
    imageName: 'Custom ancestry',
    statRows: [
      {
        label: 'Creature type',
        value: 'Humanoid (elf lineage with extraplanar influence)',
      },
      {
        label: 'Typical height and build',
        value: '5–6½ ft., lightly built, adapted for forest travel',
      },
      {
        label: 'Languages commonly spoken',
        value: 'Common, Elvish, Sylvan, plus one regional dialect',
      },
      {
        label: 'Resistances and immunities',
        value: 'Resistance to cold; advantage on saves against charm',
      },
    ],
    descriptionHtml:
      '<p>Long copy should stay aligned within each group without forcing equal columns.</p>',
  },
}

export const HeroImageAndMetadata: Story = {
  name: 'Hero metadata / image composition',
  args: {
    contentTypeKey: 'classes',
    name: 'Paladin',
    displayImage: PLACEHOLDER_DISPLAY_IMAGE,
    imageName: 'Paladin',
    mediaPresentation: { placement: 'end', frame: 'primary', size: 'default' },
    statRows: FIGHTER_STAT_ROWS,
    descriptionHtml: '<p>Metadata sits in the text column; image stays in the hero grid.</p>',
  },
}
