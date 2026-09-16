import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Button } from '@rpg/ui'
import type { ProgressionTable } from '@rpg/contracts'

import {
  martialArtsProgressionTableFixture,
  mixedProgressionTableFixture,
  rageProgressionTableFixture,
} from '../tables/progression-table-fixtures'
import { TableBuilderModal, type TableBuilderModalProps } from './table-builder-modal'

const ALLOWED_LEVELS = Array.from({ length: 20 }, (_, index) => index + 1)

const meta = {
  title: 'Content/TableBuilder/TableBuilderModal',
  component: TableBuilderModal,
  parameters: { layout: 'fullscreen' },
  args: {
    open: true,
    allowedLevels: ALLOWED_LEVELS,
    onSave: fn(),
    onOpenChange: fn(),
  },
} satisfies Meta<typeof TableBuilderModal>

export default meta
type Story = StoryObj<typeof meta>

/** Relaunchable harness so closing the modal in the story is recoverable. */
function RelaunchableModal(props: TableBuilderModalProps) {
  const [open, setOpen] = useState(true)
  const [lastSaved, setLastSaved] = useState<ProgressionTable | null>(null)

  return (
    <div className="p-6">
      <Button type="button" onClick={() => setOpen(true)}>
        Open table builder
      </Button>
      {lastSaved ? (
        <pre className="mt-4 max-h-64 overflow-auto rounded-md border border-border p-3 text-xs">
          {JSON.stringify(lastSaved, null, 2)}
        </pre>
      ) : null}
      <TableBuilderModal
        {...props}
        open={open}
        onOpenChange={setOpen}
        onSave={(table) => {
          setLastSaved(table)
          props.onSave(table)
        }}
      />
    </div>
  )
}

export const CreateEmpty: Story = {
  args: { mode: 'create' },
  render: (args) => <RelaunchableModal {...args} />,
}

export const EditRageProgression: Story = {
  args: {
    mode: 'edit',
    value: rageProgressionTableFixture,
    onDelete: fn(),
  },
  render: (args) => <RelaunchableModal {...args} />,
}

export const EditMartialArtsDice: Story = {
  args: {
    mode: 'edit',
    value: martialArtsProgressionTableFixture,
    onDelete: fn(),
  },
  render: (args) => <RelaunchableModal {...args} />,
}

export const EditMixedColumnTypes: Story = {
  args: {
    mode: 'edit',
    value: mixedProgressionTableFixture,
    onDelete: fn(),
  },
  render: (args) => <RelaunchableModal {...args} />,
}

const highLevelTableFixture: ProgressionTable = {
  id: 'aura-radius',
  name: 'Aura radius',
  kind: 'levelProgression',
  columns: [
    {
      id: 'radius',
      label: 'Radius (feet)',
      valueType: 'number',
      entries: [
        { level: 6, value: 10 },
        { level: 9, value: 30 },
      ],
    },
  ],
}

/** Constrained level set (e.g. a feature that starts at level 6). */
export const ConstrainedLevels: Story = {
  args: {
    mode: 'edit',
    value: highLevelTableFixture,
    allowedLevels: [6, 7, 8, 9, 10],
  },
  render: (args) => <RelaunchableModal {...args} />,
}
