import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Text } from '@rpg/ui'

import { AddPendingWorkflow, type AddPendingWorkflowMode } from './add-pending-workflow.client'

const meta = {
  title: 'Create Flow/AddPendingWorkflow',
  component: AddPendingWorkflow,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof AddPendingWorkflow>

export default meta
type Story = StoryObj<typeof meta>

function AddPendingWorkflowDemo({
  initialMode = 'add',
  hasPendingItems = false,
}: {
  initialMode?: AddPendingWorkflowMode
  hasPendingItems?: boolean
}) {
  const [mode, setMode] = useState<AddPendingWorkflowMode>(initialMode)

  return (
    <AddPendingWorkflow
      hasPendingItems={hasPendingItems}
      mode={mode}
      onModeChange={setMode}
      addAnotherLabel="+ Add another relationship"
      onAddAnother={() => setMode('add')}
      pendingHeading="Pending relationships"
      pendingItems={<Text>Harbor Merchants Guild · Owner</Text>}
      composing={<Text>Relationship intent and discovery composer</Text>}
    />
  )
}

export const AddMode: Story = {
  args: {
    hasPendingItems: false,
    addAnotherLabel: '+ Add another',
    onAddAnother: () => undefined,
    pendingItems: null,
  },
  render: () => <AddPendingWorkflowDemo />,
}

export const PendingMode: Story = {
  args: {
    hasPendingItems: true,
    addAnotherLabel: '+ Add another',
    onAddAnother: () => undefined,
    pendingItems: null,
  },
  render: () => <AddPendingWorkflowDemo initialMode="pending" hasPendingItems />,
}
