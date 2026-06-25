import { Heading, Text } from '@rpg/ui'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { NarrowPage } from './narrow-page'

const meta = {
  title: 'Layout/NarrowPage',
  component: NarrowPage,
} satisfies Meta<typeof NarrowPage>

export default meta
type Story = StoryObj

export const Compact: Story = {
  render: () => (
    <NarrowPage>
      <Heading variant="page" as="h2">
        Profile
      </Heading>
      <Text variant="muted">Compact spacing (default).</Text>
    </NarrowPage>
  ),
}

export const Relaxed: Story = {
  render: () => (
    <NarrowPage spacing="relaxed">
      <Heading variant="page" as="h2">
        New Species
      </Heading>
      <Text variant="muted">Relaxed spacing for form pages.</Text>
    </NarrowPage>
  ),
}

export const Loose: Story = {
  render: () => (
    <NarrowPage spacing="loose">
      <Heading variant="page" as="h2">
        Account Settings
      </Heading>
      <Text variant="muted">Loose spacing for multi-section pages.</Text>
    </NarrowPage>
  ),
}
