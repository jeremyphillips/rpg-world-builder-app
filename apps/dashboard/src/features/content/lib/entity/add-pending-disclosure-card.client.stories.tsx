import type { Meta, StoryObj } from '@storybook/react-vite'
import { Text } from '@rpg/ui'

import { AddPendingWorkflow, DisclosureChoiceComposer } from '@/lib/create-flow'

import { AddPendingDisclosureCard } from './add-pending-disclosure-card.client'
import { SILVER_CIRCLE_ENTITY } from './entity.fixture'

const meta = {
  title: 'Content/Entity/AddPendingDisclosureCard',
  component: AddPendingDisclosureCard,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof AddPendingDisclosureCard>

export default meta
type Story = StoryObj<typeof meta>

const composer = (
  <DisclosureChoiceComposer
    id="relationship"
    choices={[
      { value: 'owns', label: 'Owner' },
      { value: 'tenant', label: 'Tenant' },
      { value: 'operator', label: 'Operator' },
    ]}
    value={null}
    onValueChange={() => undefined}
    confirmLabel="Add relationship"
  />
)

export const Collapsed: Story = {
  args: {
    itemId: 'org-1',
    entity: SILVER_CIRCLE_ENTITY,
  },
  render: (args) => (
    <AddPendingWorkflow
      hasPendingItems={false}
      addAnotherLabel="+ Add another"
      onAddAnother={() => undefined}
      pendingItems={null}
      addDiscovery={<AddPendingDisclosureCard {...args}>{composer}</AddPendingDisclosureCard>}
    />
  ),
}

export const Expanded: Story = {
  args: {
    itemId: 'org-1',
    entity: SILVER_CIRCLE_ENTITY,
    expanded: true,
  },
  render: (args) => (
    <AddPendingWorkflow
      hasPendingItems={false}
      addAnotherLabel="+ Add another"
      onAddAnother={() => undefined}
      pendingItems={null}
      addDiscovery={<AddPendingDisclosureCard {...args}>{composer}</AddPendingDisclosureCard>}
    />
  ),
}

export const ZeroEligible: Story = {
  args: {
    itemId: 'org-1',
    entity: SILVER_CIRCLE_ENTITY,
    addDisabled: true,
    addDisabledReason: 'No eligible relationships for this Organization.',
  },
  render: (args) => (
    <AddPendingDisclosureCard {...args}>
      <Text>Should not open</Text>
    </AddPendingDisclosureCard>
  ),
}
