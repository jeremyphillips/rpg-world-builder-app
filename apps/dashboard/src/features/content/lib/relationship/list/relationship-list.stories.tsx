import type { Meta, StoryObj } from '@storybook/react-vite'

import { RelationshipList } from './relationship-list'

const meta = {
  title: 'Content/Relationship/RelationshipList',
  component: RelationshipList.Root,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof RelationshipList.Root>

export default meta
type Story = StoryObj<typeof RelationshipList.Root>

export const SectionEmpty: Story = {
  render: () => (
    <RelationshipList.Root
      itemCount={0}
      emptyLabel="No members linked."
      action={{ label: 'Add member', onSelect: () => undefined }}
    />
  ),
}

export const PopulatedWithFooter: Story = {
  render: () => (
    <RelationshipList.Root
      itemCount={2}
      action={{ label: 'Add member', onSelect: () => undefined }}
    >
      <RelationshipList.Group itemCount={2}>
        <RelationshipList.Row title="Circle Envoy" href="/npc/1" description="NPC · Human" />
        <RelationshipList.Row title="Verna" href="/pc/1" description="PC · Dwarf" />
      </RelationshipList.Group>
    </RelationshipList.Root>
  ),
}

export const NestedGroups: Story = {
  render: () => (
    <RelationshipList.Root itemCount={2}>
      <RelationshipList.Group itemCount={1} label="Headquarters">
        <RelationshipList.Row title="Guild Hall" href="/locations/guild-hall" />
      </RelationshipList.Group>
      <RelationshipList.Group itemCount={1} label="Sites">
        <RelationshipList.Row title="Outpost" href="/locations/outpost" />
      </RelationshipList.Group>
    </RelationshipList.Root>
  ),
}

export const SlotEmptyWithHeaderAction: Story = {
  render: () => (
    <RelationshipList.Root itemCount={0}>
      <RelationshipList.Group
        itemCount={0}
        label="Governed by"
        emptyLabel="No governing organization."
        headerAction={{ label: 'Add governing organization', onSelect: () => undefined }}
      />
    </RelationshipList.Root>
  ),
}
