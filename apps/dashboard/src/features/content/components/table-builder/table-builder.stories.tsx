import type { Meta, StoryObj } from '@storybook/react-vite'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { ProgressionTable } from '@rpg/contracts'

import {
  createEmptyTableBuilderDraft,
  tableToDraft,
  type TableBuilderFormValues,
} from '../../lib/table-builder/table-builder-draft'
import { tableBuilderFormSchema } from '../../lib/table-builder/table-builder-form-schema'
import {
  martialArtsProgressionTableFixture,
  mixedProgressionTableFixture,
  rageProgressionTableFixture,
} from '../tables/progression-table-fixtures'
import { TableBuilder } from './table-builder'

const ALLOWED_LEVELS = Array.from({ length: 20 }, (_, index) => index + 1)

type HarnessProps = {
  table?: ProgressionTable
  allowedLevels?: readonly number[]
}

/** Standalone harness — the modal normally owns this isolated draft form. */
function TableBuilderHarness({ table, allowedLevels = ALLOWED_LEVELS }: HarnessProps) {
  const form = useForm<TableBuilderFormValues>({
    resolver: zodResolver(tableBuilderFormSchema),
    defaultValues: table !== undefined ? tableToDraft(table) : createEmptyTableBuilderDraft(),
  })

  return (
    <form noValidate onSubmit={form.handleSubmit(() => undefined)}>
      <TableBuilder form={form} allowedLevels={allowedLevels} />
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
