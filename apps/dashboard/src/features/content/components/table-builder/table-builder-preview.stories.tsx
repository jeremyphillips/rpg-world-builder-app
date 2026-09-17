import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import {
  tableToDraft,
  type TableBuilderFormValues,
} from '../../lib/table-builder/table-builder-draft'
import { rageProgressionTableFixture } from '../tables/progression-table-fixtures'
import { TableBuilderPreview } from './table-builder-preview'

type HarnessProps = {
  values: TableBuilderFormValues
}

function PreviewHarness({ values }: HarnessProps) {
  const form = useForm<TableBuilderFormValues>({ defaultValues: values })
  return (
    <FormProvider {...form}>
      <TableBuilderPreview />
    </FormProvider>
  )
}

const meta = {
  title: 'Content/TableBuilder/TableBuilderPreview',
  component: PreviewHarness,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PreviewHarness>

export default meta
type Story = StoryObj<typeof meta>

export const ResolvedDraft: Story = {
  args: { values: tableToDraft(rageProgressionTableFixture) },
}

export const IncompleteDraft: Story = {
  args: {
    values: {
      kind: 'levelProgression',
      name: '',
      columns: [
        { key: 'a', label: 'Uses', valueType: 'number', format: 'plain' },
        { key: 'b', label: '', valueType: 'dice', format: 'plain' },
      ],
      rows: [
        { level: '1', cells: { a: '2' } },
        { level: '', cells: { b: { count: '1', faces: '6' } } },
      ],
    },
  },
}

export const EmptyDraft: Story = {
  args: { values: { kind: 'levelProgression', name: '', columns: [], rows: [] } },
}
