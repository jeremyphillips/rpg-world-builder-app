import { Heading, Text } from '@rpg/ui'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { WidePage } from './wide-page'

const meta = {
  title: 'Layout/WidePage',
  component: WidePage,
} satisfies Meta<typeof WidePage>

export default meta
type Story = StoryObj

export const ListSpacing: Story = {
  render: () => (
    <WidePage spacing="list">
      <Heading variant="page" as="h1">
        Species
      </Heading>
      <Text variant="muted">List page body (space-y-4).</Text>
    </WidePage>
  ),
}

export const Relaxed: Story = {
  render: () => (
    <WidePage spacing="relaxed">
      <Heading variant="page" as="h1">
        Fighter
      </Heading>
      <Text variant="muted">Detail page with multiple sections (space-y-6).</Text>
    </WidePage>
  ),
}
