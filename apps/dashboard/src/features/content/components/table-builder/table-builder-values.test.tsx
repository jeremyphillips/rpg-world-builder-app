import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import {
  createEmptyTableBuilderDraft,
  createTableBuilderColumnDraft,
  type TableBuilderFormValues,
} from '../../lib/table-builder/table-builder-draft'
import { TableBuilderValues } from './table-builder-values'

function ValuesHarness({ kind }: { kind: 'levelProgression' | 'general' }) {
  const form = useForm<TableBuilderFormValues>({
    defaultValues: createEmptyTableBuilderDraft(kind),
  })

  return (
    <FormProvider {...form}>
      <TableBuilderValues allowedLevels={[1, 2, 3]} />
    </FormProvider>
  )
}

describe('TableBuilderValues', () => {
  it('shows only the section label and hint when no columns exist yet', () => {
    render(<ValuesHarness kind="general" />)

    expect(screen.getByText('Values')).toBeInTheDocument()
    expect(screen.getByText('Add a column to start adding rows.')).toBeInTheDocument()
    expect(screen.queryByText('No columns yet')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add row' })).not.toBeInTheDocument()
    expect(screen.queryByText('No rows added.')).not.toBeInTheDocument()
  })

  it('keeps values header-only for level progression tables without columns', () => {
    render(<ValuesHarness kind="levelProgression" />)

    expect(screen.getByText('Add a column to start adding rows.')).toBeInTheDocument()
    expect(screen.queryByText('Level')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add row' })).not.toBeInTheDocument()
  })

  it('shows the normal general table UI after the first column is added', async () => {
    const user = userEvent.setup()

    function HarnessWithColumnAdd() {
      const form = useForm<TableBuilderFormValues>({
        defaultValues: createEmptyTableBuilderDraft('general'),
      })

      return (
        <FormProvider {...form}>
          <button
            type="button"
            onClick={() =>
              form.setValue('columns', [
                { ...createTableBuilderColumnDraft(), label: '1d10', valueType: 'number' },
              ])
            }
          >
            Add test column
          </button>
          <TableBuilderValues allowedLevels={[]} />
        </FormProvider>
      )
    }

    render(<HarnessWithColumnAdd />)

    await user.click(screen.getByRole('button', { name: 'Add test column' }))

    expect(
      screen.getByText('Add rows in display order. Blank cells stay empty.'),
    ).toBeInTheDocument()
    expect(screen.getByText('1d10')).toBeInTheDocument()
    expect(screen.getByText('No rows added.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add row' })).toBeInTheDocument()
  })
})
