import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Heading, RichTextContent } from '@rpg/ui'

import { withDashboardProviders } from '../../../../.storybook/decorators'
import { ContentDetailLayout } from './content-detail-layout'

const meta = {
  title: 'Content/ContentDetailLayout',
  component: ContentDetailLayout,
  parameters: { layout: 'padded' },
  decorators: [withDashboardProviders],
} satisfies Meta<typeof ContentDetailLayout>

export default meta
type Story = StoryObj<typeof meta>

const PLACEHOLDER_IMAGE = 'https://placehold.co/400x500/1e293b/94a3b8?text=Class+Art'

const FIGHTER_STAT_ROWS = [
  { label: 'Hit Die', value: 'd10 per level' },
  { label: 'Primary Abilities', value: 'Strength, Dexterity' },
  { label: 'Saving Throws', value: 'Strength, Constitution' },
]

export const Default: Story = {
  args: {
    name: 'Fighter',
    imageUrl: PLACEHOLDER_IMAGE,
    imageName: 'Fighter',
    statRows: FIGHTER_STAT_ROWS,
    descriptionContent: (
      <RichTextContent
        html="<p>A master of martial combat, skilled with a variety of weapons and armor.</p>"
        size="sm"
        tone="muted"
      />
    ),
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
    name: 'Wizard',
    imageUrl: PLACEHOLDER_IMAGE,
    imageName: 'Wizard',
    statRows: [{ label: 'Hit Die', value: 'd6 per level' }],
    actions: (
      <Button variant="outline" size="sm">
        Duplicate
      </Button>
    ),
    descriptionContent: (
      <RichTextContent
        html="<p>A scholarly magic-user capable of manipulating the structures of reality.</p>"
        size="sm"
        tone="muted"
      />
    ),
  },
}

export const HeroOnly: Story = {
  args: {
    name: 'Shield',
    imageUrl: PLACEHOLDER_IMAGE,
    imageName: 'Shield',
    statRows: [{ label: 'AC', value: '+2' }],
  },
}
