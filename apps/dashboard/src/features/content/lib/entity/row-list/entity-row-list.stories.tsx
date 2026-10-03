import type { Meta, StoryObj } from '@storybook/react-vite'

import { EntityRowList } from './entity-row-list'

const meta = {
  title: 'Content/Entity/EntityRowList',
  component: EntityRowList.Root,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof EntityRowList.Root>

export default meta
type Story = StoryObj<typeof EntityRowList.Root>

export const SectionEmpty: Story = {
  render: () => (
    <EntityRowList.Root
      itemCount={0}
      emptyLabel="No members linked."
      action={{ label: 'Add member', onSelect: () => undefined }}
    />
  ),
}

export const PopulatedWithFooter: Story = {
  render: () => (
    <EntityRowList.Root itemCount={2} action={{ label: 'Add member', onSelect: () => undefined }}>
      <EntityRowList.Group itemCount={2}>
        <EntityRowList.Row heading="Circle Envoy" headingHref="/npc/1" description="NPC · Human" />
        <EntityRowList.Row heading="Verna" headingHref="/pc/1" description="PC · Dwarf" />
      </EntityRowList.Group>
    </EntityRowList.Root>
  ),
}

export const UnlabeledGroup: Story = {
  render: () => (
    <EntityRowList.Root itemCount={1}>
      <EntityRowList.Group itemCount={1}>
        <EntityRowList.Row
          heading="Guild Envoy"
          headingAccessory="Journeyman"
          description="NPC · Human"
        />
      </EntityRowList.Group>
    </EntityRowList.Root>
  ),
}
