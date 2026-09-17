import type { Meta, StoryObj } from '@storybook/react-vite'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { ProgressionTable } from '@rpg/contracts'

import {
  createEmptyTableBuilderDraft,
  tableToDraft,
  type TableBuilderFormValues,
} from '../../lib/table-builder/table-builder-draft'
import type {
  TableBuilderHostConfig,
  TableBuilderMode,
} from '../../lib/table-builder/table-builder-host-config'
import { tableBuilderFormSchema } from '../../lib/table-builder/table-builder-form-schema'
import {
  martialArtsProgressionTableFixture,
  mixedProgressionTableFixture,
  rageProgressionTableFixture,
} from '../tables/progression-table-fixtures'
import { TableBuilder } from './table-builder'

const ALLOWED_LEVELS = Array.from({ length: 20 }, (_, index) => index + 1)

const CLASS_FEATURE_CONFIG: TableBuilderHostConfig = {
  allowedKinds: ['levelProgression', 'general'],
  recommendedKind: 'levelProgression',
  allowedLevels: ALLOWED_LEVELS,
}

type HarnessProps = {
  table?: ProgressionTable
  config?: TableBuilderHostConfig
  mode?: TableBuilderMode
}

/** Standalone harness — the modal normally owns this isolated draft form. */
function TableBuilderHarness({
  table,
  config = CLASS_FEATURE_CONFIG,
  mode = table === undefined ? 'create' : 'edit',
}: HarnessProps) {
  const form = useForm<TableBuilderFormValues>({
    resolver: zodResolver(tableBuilderFormSchema),
    defaultValues: table !== undefined ? tableToDraft(table) : createEmptyTableBuilderDraft(),
  })

  return (
    <form noValidate onSubmit={form.handleSubmit(() => undefined)}>
      <TableBuilder form={form} config={config} mode={mode} />
    </form>
  )
}

const meta = {
  title: 'Content/TableBuilder/TableBuilder',
  component: TableBuilderHarness,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof TableBuilderHarness>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {}

export const RageProgression: Story = {
  args: { table: rageProgressionTableFixture },
}

export const MartialArtsDice: Story = {
  args: { table: martialArtsProgressionTableFixture },
}

export const MixedColumnTypes: Story = {
  args: { table: mixedProgressionTableFixture },
}

export const SignedFormatting: Story = {
  args: { table: rageProgressionTableFixture },
}

export const KindSelectionCreate: Story = {
  args: { mode: 'create', config: CLASS_FEATURE_CONFIG },
}

export const KindReadOnlyEdit: Story = {
  args: {
    table: rageProgressionTableFixture,
    mode: 'edit',
    config: CLASS_FEATURE_CONFIG,
  },
}
