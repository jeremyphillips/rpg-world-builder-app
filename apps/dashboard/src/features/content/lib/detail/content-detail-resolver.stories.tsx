import type { Meta, StoryObj } from '@storybook/react-vite'
import { Text } from '@rpg/ui'

import { ContentDetailResolver } from './content-detail-resolver'

const meta = {
  title: 'Content/ContentDetailResolver',
  component: ContentDetailResolver,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ContentDetailResolver>

export default meta
type Story = StoryObj

type DemoItem = { id: string; name: string }

const ITEMS: DemoItem[] = [{ id: 'demo-1', name: 'Longsword' }]

export const Loading: Story = {
  render: () => (
    <ContentDetailResolver
      isPending={true}
      isError={false}
      items={ITEMS}
      itemId="demo-1"
      loadErrorLabel="Could not load weapons."
      notFoundLabel="Weapon not found."
    >
      {(item) => <Text>{item.name}</Text>}
    </ContentDetailResolver>
  ),
}

export const Error: Story = {
  render: () => (
    <ContentDetailResolver
      isPending={false}
      isError={true}
      items={ITEMS}
      itemId="demo-1"
      loadErrorLabel="Could not load weapons."
      notFoundLabel="Weapon not found."
    >
      {(item) => <Text>{item.name}</Text>}
    </ContentDetailResolver>
  ),
}

export const NotFound: Story = {
  render: () => (
    <ContentDetailResolver
      isPending={false}
      isError={false}
      items={ITEMS}
      itemId="missing"
      loadErrorLabel="Could not load weapons."
      notFoundLabel="Weapon not found."
    >
      {(item) => <Text>{item.name}</Text>}
    </ContentDetailResolver>
  ),
}

export const Ready: Story = {
  render: () => (
    <ContentDetailResolver
      isPending={false}
      isError={false}
      items={ITEMS}
      itemId="demo-1"
      loadErrorLabel="Could not load weapons."
      notFoundLabel="Weapon not found."
    >
      {(item) => <Text>{item.name}</Text>}
    </ContentDetailResolver>
  ),
}
