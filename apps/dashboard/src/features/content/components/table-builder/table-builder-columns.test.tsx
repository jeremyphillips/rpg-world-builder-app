import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import {
  createEmptyTableBuilderDraft,
  createTableBuilderColumnDraft,
  type TableBuilderFormValues,
} from '../../lib/table-builder/table-builder-draft'
import { TableBuilderColumns } from './table-builder-columns'

function ColumnsHarness({ kind }: { kind: 'levelProgression' | 'general' }) {
  const form = useForm<TableBuilderFormValues>({
    defaultValues: createEmptyTableBuilderDraft(kind),
  })

  return (
    <FormProvider {...form}>
      <TableBuilderColumns />
    </FormProvider>
  )
}

describe('TableBuilderColumns', () => {
  it('shows the dashed empty state with add-column action when no columns exist', () => {
    render(<ColumnsHarness kind="general" />)

    expect(screen.getByText('Columns')).toBeInTheDocument()
    expect(screen.getByText('Add the columns for this table.')).toBeInTheDocument()
    expect(screen.getByText('No columns yet')).toBeInTheDocument()
    expect(
      screen.getByText('Add your first column to define the table structure.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add column' })).toBeInTheDocument()
  })

  it('adds the first column from the empty-state action', async () => {
    const user = userEvent.setup()
    render(<ColumnsHarness kind="general" />)

    await user.click(screen.getByRole('button', { name: 'Add column' }))

    expect(screen.queryByText('No columns yet')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add column' })).toBeInTheDocument()
    expect(screen.getByLabelText('Column name 1')).toBeInTheDocument()
  })

  it('uses the same empty state for level progression tables', () => {
    render(<ColumnsHarness kind="levelProgression" />)

    expect(
      screen.getByText('Add the value columns for this table. "Level" is included automatically.'),
    ).toBeInTheDocument()
    expect(screen.getByText('No columns yet')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add column' })).toBeInTheDocument()
  })

  it('renders populated column rows after columns exist', () => {
    function HarnessWithColumn() {
      const form = useForm<TableBuilderFormValues>({
        defaultValues: {
          ...createEmptyTableBuilderDraft('general'),
          columns: [{ ...createTableBuilderColumnDraft(), label: 'Damage', valueType: 'text' }],
        },
      })

      return (
        <FormProvider {...form}>
          <TableBuilderColumns />
        </FormProvider>
      )
    }

    render(<HarnessWithColumn />)

    expect(screen.queryByText('No columns yet')).not.toBeInTheDocument()
    expect(screen.getByDisplayValue('Damage')).toBeInTheDocument()
  })
})
