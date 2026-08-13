import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Button, Text } from '@rpg/ui'

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
  showBranch = false,
}: {
  initialMode?: AddPendingWorkflowMode
  hasPendingItems?: boolean
  showBranch?: boolean
}) {
  const [mode, setMode] = useState<AddPendingWorkflowMode>(initialMode)
  const [branch, setBranch] = useState(showBranch)

  return (
    <AddPendingWorkflow
      hasPendingItems={hasPendingItems}
      mode={mode}
      onModeChange={setMode}
      addAnotherLabel="+ Add another"
      onAddAnother={() => setMode('add')}
      pendingHeading="Pending relationships"
      pendingItems={<Text>Harbor Merchants Guild · Owner</Text>}
      addDescription={<Text>Search or create an item to associate.</Text>}
      addDiscovery={<Text>Harbor Merchants Guild</Text>}
      addAlternateAction={
        <Button type="button" variant="ghost" onClick={() => setBranch(true)}>
          + Create new
        </Button>
      }
      addBranch={branch ? <Text>New item form</Text> : undefined}
      addBranchBackLabel="Choose existing"
      onAddBranchBack={() => setBranch(false)}
    />
  )
}

export const AddMode: Story = {
  args: {
    hasPendingItems: false,
    addAnotherLabel: '+ Add another',
    onAddAnother: () => undefined,
    pendingItems: null,
    addDiscovery: null,
  },
  render: () => <AddPendingWorkflowDemo />,
}

export const PendingMode: Story = {
  args: {
    hasPendingItems: true,
    addAnotherLabel: '+ Add another',
    onAddAnother: () => undefined,
    pendingItems: null,
    addDiscovery: null,
  },
  render: () => <AddPendingWorkflowDemo initialMode="pending" hasPendingItems />,
}

export const AddBranch: Story = {
  args: {
    hasPendingItems: false,
    addAnotherLabel: '+ Add another',
    onAddAnother: () => undefined,
    pendingItems: null,
    addDiscovery: null,
  },
  render: () => <AddPendingWorkflowDemo showBranch />,
}
