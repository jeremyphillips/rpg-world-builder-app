import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Button } from '@rpg/ui'
import type { ProgressionTable } from '@rpg/contracts'

import type { TableBuilderSavedTable } from '../../lib/table-builder/table-builder-kind'
import type { TableBuilderHostConfig } from '../../lib/table-builder/table-builder-host-config'

import {
  martialArtsProgressionTableFixture,
  mixedProgressionTableFixture,
  rageProgressionTableFixture,
} from '../tables/progression-table-fixtures'
import { TableBuilderModal, type TableBuilderModalProps } from './table-builder-modal'

const ALLOWED_LEVELS = Array.from({ length: 20 }, (_, index) => index + 1)

const PROGRESSION_CONFIG: TableBuilderHostConfig = {
  allowedKinds: ['levelProgression'],
  allowedLevels: ALLOWED_LEVELS,
}

const CLASS_FEATURE_CONFIG: TableBuilderHostConfig = {
  allowedKinds: ['levelProgression', 'general'],
  recommendedKind: 'levelProgression',
  allowedLevels: ALLOWED_LEVELS,
}

const meta = {
  title: 'Content/TableBuilder/TableBuilderModal',
  component: TableBuilderModal,
  parameters: { layout: 'fullscreen' },
  args: {
    open: true,
    config: PROGRESSION_CONFIG,
    onSave: fn(),
    onOpenChange: fn(),
  },
} satisfies Meta<typeof TableBuilderModal>

export default meta
type Story = StoryObj<typeof meta>

/** Relaunchable harness so closing the modal in the story is recoverable. */
function RelaunchableModal(props: TableBuilderModalProps) {
  const [open, setOpen] = useState(true)
  const [lastSaved, setLastSaved] = useState<TableBuilderSavedTable | null>(null)

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

export const CreateWithKindSelection: Story = {
  args: { mode: 'create', config: CLASS_FEATURE_CONFIG },
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
    config: {
      ...PROGRESSION_CONFIG,
      allowedLevels: [6, 7, 8, 9, 10],
    },
  },
  render: (args) => <RelaunchableModal {...args} />,
}

const longLabelTableFixture: ProgressionTable = {
  id: 'long-labels',
  name: 'Very long progression table name that should wrap in the authoring pane',
  kind: 'levelProgression',
  columns: [
    {
      id: 'uses',
      label: 'Extremely long column label for resource uses that should wrap cleanly',
      valueType: 'number',
      entries: [{ level: 1, value: 2 }],
    },
  ],
}

export const LongWrappedLabels: Story = {
  args: {
    mode: 'edit',
    value: longLabelTableFixture,
  },
  render: (args) => <RelaunchableModal {...args} />,
}

const manyColumnsFixture: ProgressionTable = {
  id: 'many-columns',
  name: 'Many columns',
  kind: 'levelProgression',
  columns: Array.from({ length: 8 }, (_, index) => ({
    id: `column-${index + 1}`,
    label: `Column ${index + 1}`,
    valueType: 'number' as const,
    entries: [{ level: 1, value: index + 1 }],
  })),
}

export const ManyColumns: Story = {
  args: {
    mode: 'edit',
    value: manyColumnsFixture,
  },
  render: (args) => <RelaunchableModal {...args} />,
}

const manyRowsFixture: ProgressionTable = {
  id: 'many-rows',
  name: 'Many rows',
  kind: 'levelProgression',
  columns: [
    {
      id: 'uses',
      label: 'Uses',
      valueType: 'number',
      entries: Array.from({ length: 12 }, (_, index) => ({
        level: index * 2 + 1,
        value: index + 1,
      })),
    },
  ],
}

export const ManyRows: Story = {
  args: {
    mode: 'edit',
    value: manyRowsFixture,
  },
  render: (args) => <RelaunchableModal {...args} />,
}

export const NarrowViewport: Story = {
  args: {
    mode: 'edit',
    value: manyColumnsFixture,
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: (args) => <RelaunchableModal {...args} />,
}
