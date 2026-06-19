import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Heading, Text } from '@rpg/ui'

import { ContentDetailLayout } from './content-detail-layout'

const meta = {
  title: 'Content/ContentDetailLayout',
  component: ContentDetailLayout,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ContentDetailLayout>

export default meta
type Story = StoryObj<typeof meta>

const PLACEHOLDER_IMAGE = 'https://placehold.co/400x500/1e293b/94a3b8?text=Class+Art'

export const Default: Story = {
  args: {
    imageUrl: PLACEHOLDER_IMAGE,
    imageName: 'Fighter',
    children: (
      <div className="space-y-4">
        <Heading variant="page" as="h2">
          Fighter
        </Heading>
        <Text variant="muted">
          A master of martial combat, skilled with a variety of weapons and armor.
        </Text>
      </div>
    ),
  },
}

export const WithActions: Story = {
  args: {
    imageUrl: PLACEHOLDER_IMAGE,
    imageName: 'Wizard',
    actions: (
      <Button variant="outline" size="sm">
        Edit
      </Button>
    ),
    children: (
      <div className="space-y-4">
        <Heading variant="page" as="h2">
          Wizard
        </Heading>
        <Text variant="muted">
          A scholarly magic-user capable of manipulating the structures of reality.
        </Text>
      </div>
    ),
  },
}
