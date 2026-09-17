import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import {
  createEmptyTableBuilderDraft,
  createTableBuilderColumnDraft,
  type TableBuilderFormValues,
} from '../../lib/table-builder/table-builder-draft'
import { TableBuilderKindField } from './table-builder-kind-field'
import { TableBuilderPreview } from './table-builder-preview'

const CLASS_FEATURE_CONFIG = {
  allowedKinds: ['levelProgression', 'general'] as const,
  recommendedKind: 'levelProgression' as const,
}

function PreviewHarness({
  initialKind = 'levelProgression' as const,
  values,
}: {
  initialKind?: 'levelProgression' | 'general'
  values?: Partial<TableBuilderFormValues>
}) {
  const form = useForm<TableBuilderFormValues>({
    defaultValues: {
      ...createEmptyTableBuilderDraft(initialKind),
      columns: [{ ...createTableBuilderColumnDraft(), label: 'Effect' }],
      rows: initialKind === 'levelProgression' ? [{ level: '1', cells: {} }] : [{ cells: {} }],
      ...values,
    },
  })

  return (
    <FormProvider {...form}>
      <TableBuilderKindField config={CLASS_FEATURE_CONFIG} mode="create" />
      <TableBuilderPreview />
    </FormProvider>
  )
}

describe('TableBuilderPreview', () => {
  it('renders a Level axis for progression drafts', () => {
    render(<PreviewHarness initialKind="levelProgression" />)

    expect(screen.getByRole('region', { name: 'Preview' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Level' })).toBeInTheDocument()
  })

  it('renders no Level axis for general drafts', () => {
    render(<PreviewHarness initialKind="general" />)

    expect(screen.queryByRole('columnheader', { name: 'Level' })).not.toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Effect' })).toBeInTheDocument()
  })

  it('updates the preview axis after confirming a kind switch on a populated draft', async () => {
    const user = userEvent.setup()
    render(<PreviewHarness initialKind="levelProgression" />)

    expect(screen.getByRole('columnheader', { name: 'Level' })).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /General table/i }))
    const confirm = await screen.findByRole('alertdialog', { name: 'Change table type?' })
    await user.click(within(confirm).getByRole('button', { name: 'Change type' }))

    expect(screen.queryByRole('columnheader', { name: 'Level' })).not.toBeInTheDocument()
    expect(screen.getByText('Preview appears after you add a column.')).toBeInTheDocument()
  })

  it('shows the inset gate when no columns exist yet', () => {
    render(
      <PreviewHarness
        values={{
          columns: [],
          rows: [],
        }}
      />,
    )

    expect(screen.getByText('Preview appears after you add a column.')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('shows headers and a no-rows placeholder when columns exist without rows', () => {
    render(
      <PreviewHarness
        initialKind="levelProgression"
        values={{
          columns: [{ ...createTableBuilderColumnDraft(), label: '' }],
          rows: [],
        }}
      />,
    )

    expect(screen.getByRole('columnheader', { name: 'Level' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Column 1' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'No rows yet.' })).toBeInTheDocument()
  })
})
