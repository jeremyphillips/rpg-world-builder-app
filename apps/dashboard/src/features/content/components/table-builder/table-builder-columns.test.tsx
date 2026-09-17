import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import {
  createEmptyTableBuilderDraft,
  createTableBuilderColumnDraft,
  type TableBuilderFormValues,
} from '../../lib/table-builder/table-builder-draft'
import { TableBuilderColumns } from './table-builder-columns'
import { TableBuilderValues } from './table-builder-values'

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

  it('deletes an empty column immediately without confirmation', async () => {
    const user = userEvent.setup()
    render(<ColumnsHarness kind="general" />)

    await user.click(screen.getByRole('button', { name: 'Add column' }))
    await user.click(screen.getByRole('button', { name: 'Add column' }))

    await user.click(screen.getByRole('button', { name: 'Delete column 1' }))

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Column name 1')).toBeInTheDocument()
    expect(screen.queryByLabelText('Column name 2')).not.toBeInTheDocument()
  })

  it('confirms before deleting a populated column and preserves data on cancel', async () => {
    const user = userEvent.setup()

    function HarnessWithValues() {
      const form = useForm<TableBuilderFormValues>({
        defaultValues: {
          kind: 'general',
          name: 'Test',
          columns: [
            { key: 'c1', label: 'Species', valueType: 'text', format: 'plain' },
            { key: 'c2', label: 'Notes', valueType: 'text', format: 'plain' },
          ],
          rows: [{ key: 'r1', cells: { c1: 'Elf', c2: '' } }],
        },
      })

      return (
        <FormProvider {...form}>
          <TableBuilderColumns />
        </FormProvider>
      )
    }

    render(<HarnessWithValues />)

    await user.click(screen.getByRole('button', { name: 'Delete Species' }))

    const confirm = await screen.findByRole('alertdialog', { name: 'Delete column?' })
    await user.click(within(confirm).getByRole('button', { name: 'Cancel' }))

    expect(screen.getByDisplayValue('Species')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Notes')).toBeInTheDocument()
  })

  it('confirms before deleting the last column when rows exist and clears rows on confirm', async () => {
    const user = userEvent.setup()

    function HarnessWithRows() {
      const form = useForm<TableBuilderFormValues>({
        defaultValues: {
          kind: 'levelProgression',
          name: 'Test',
          columns: [{ key: 'c1', label: 'Uses', valueType: 'number', format: 'plain' }],
          rows: [{ level: '1', cells: { c1: '' } }],
        },
      })

      return (
        <FormProvider {...form}>
          <TableBuilderColumns />
          <TableBuilderValues allowedLevels={[1, 2, 3]} />
        </FormProvider>
      )
    }

    render(<HarnessWithRows />)
    expect(screen.getByLabelText('Uses, level 1')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Delete Uses' }))

    const confirm = await screen.findByRole('alertdialog', { name: 'Delete last column?' })
    await user.click(within(confirm).getByRole('button', { name: 'Delete column' }))

    expect(screen.queryByLabelText('Uses, level 1')).not.toBeInTheDocument()
    expect(screen.getByText('Add a column to start adding rows.')).toBeInTheDocument()
  })
})
