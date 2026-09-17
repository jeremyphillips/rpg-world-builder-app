import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { createEmptyTableBuilderDraft } from '../../lib/table-builder/table-builder-draft'
import type { TableBuilderHostConfig } from '../../lib/table-builder/table-builder-host-config'
import { TableBuilderKindField } from './table-builder-kind-field'

const CLASS_FEATURE_CONFIG: TableBuilderHostConfig = {
  allowedKinds: ['levelProgression', 'general'],
  recommendedKind: 'levelProgression',
}

function Harness({
  mode,
  config = CLASS_FEATURE_CONFIG,
  initialKind = 'levelProgression',
}: {
  mode: 'create' | 'edit'
  config?: TableBuilderHostConfig
  initialKind?: 'levelProgression' | 'general'
}) {
  const form = useForm({
    defaultValues: createEmptyTableBuilderDraft(initialKind),
  })

  return (
    <FormProvider {...form}>
      <TableBuilderKindField config={config} mode={mode} />
    </FormProvider>
  )
}

describe('TableBuilderKindField', () => {
  it('renders selectable cards on create when multiple kinds are allowed', () => {
    render(<Harness mode="create" />)

    expect(screen.getByRole('radiogroup', { name: 'Table type' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /General table/i })).toBeInTheDocument()
  })

  it('renders compact metadata on edit without control-band sizing', () => {
    render(<Harness mode="edit" />)

    expect(screen.queryByRole('radiogroup', { name: 'Table type' })).not.toBeInTheDocument()
    const value = screen.getByText('Level progression', { selector: '[aria-labelledby]' })
    expect(value.className).not.toMatch(/min-h-9|h-9|px-3/)
  })

  it('renders compact metadata for single-kind hosts on create', () => {
    render(<Harness mode="create" config={{ allowedKinds: ['general'] }} initialKind="general" />)

    expect(screen.queryByRole('radiogroup', { name: 'Table type' })).not.toBeInTheDocument()
    expect(screen.getByText('General table', { selector: '[aria-labelledby]' })).toBeInTheDocument()
  })

  it('switches kind immediately when the draft is empty', async () => {
    const user = userEvent.setup()
    render(<Harness mode="create" />)

    await user.click(screen.getByRole('radio', { name: /General table/i }))

    expect(screen.getByRole('radio', { name: /General table/i })).toBeChecked()
  })
})
