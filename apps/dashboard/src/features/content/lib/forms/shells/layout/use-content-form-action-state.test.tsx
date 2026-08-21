import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'

import { useContentFormActionState } from './use-content-form-action-state'

function ActionStateProbe({
  mode,
  pending,
  readOnly = false,
}: {
  mode: 'create' | 'edit'
  pending: boolean
  readOnly?: boolean
}) {
  const state = useContentFormActionState({ mode, pending, readOnly })

  return (
    <div
      data-testid="action-state"
      data-submit-disabled={String(state.submitDisabled)}
      data-discard-disabled={String(state.discardDisabled)}
      data-has-unsaved-edits={String(state.hasUnsavedEdits)}
    />
  )
}

describe('useContentFormActionState', () => {
  it('keeps create submit enabled unless pending or read-only', () => {
    function Page() {
      const form = useForm({ defaultValues: { name: '' } })

      return (
        <FormProvider {...form}>
          <ActionStateProbe mode="create" pending={false} />
        </FormProvider>
      )
    }

    render(<Page />)

    expect(screen.getByTestId('action-state')).toHaveAttribute('data-submit-disabled', 'false')
    expect(screen.getByTestId('action-state')).toHaveAttribute('data-discard-disabled', 'false')
  })

  it('disables create submit while pending', () => {
    function Page() {
      const form = useForm({ defaultValues: { name: 'Fireball' } })

      return (
        <FormProvider {...form}>
          <ActionStateProbe mode="create" pending={true} />
        </FormProvider>
      )
    }

    render(<Page />)

    expect(screen.getByTestId('action-state')).toHaveAttribute('data-submit-disabled', 'true')
    expect(screen.getByTestId('action-state')).toHaveAttribute('data-discard-disabled', 'true')
  })

  it('disables create submit when read-only', () => {
    function Page() {
      const form = useForm({ defaultValues: { name: 'Fireball' } })

      return (
        <FormProvider {...form}>
          <ActionStateProbe mode="create" pending={false} readOnly />
        </FormProvider>
      )
    }

    render(<Page />)

    expect(screen.getByTestId('action-state')).toHaveAttribute('data-submit-disabled', 'true')
  })

  it('disables edit actions until a field is dirty', async () => {
    const user = userEvent.setup()

    function Page() {
      const form = useForm({ defaultValues: { name: 'Fireball' } })

      return (
        <FormProvider {...form}>
          <input aria-label="Name" {...form.register('name')} />
          <ActionStateProbe mode="edit" pending={false} />
        </FormProvider>
      )
    }

    render(<Page />)

    expect(screen.getByTestId('action-state')).toHaveAttribute('data-submit-disabled', 'true')
    expect(screen.getByTestId('action-state')).toHaveAttribute('data-discard-disabled', 'true')

    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'x')

    expect(screen.getByTestId('action-state')).toHaveAttribute('data-submit-disabled', 'false')
    expect(screen.getByTestId('action-state')).toHaveAttribute('data-discard-disabled', 'false')
    expect(screen.getByTestId('action-state')).toHaveAttribute('data-has-unsaved-edits', 'true')
  })

  it('keeps edit Save enabled when dirty even if values would fail validation', async () => {
    const user = userEvent.setup()

    function Page() {
      const form = useForm({ defaultValues: { name: 'Fireball' } })

      return (
        <FormProvider {...form}>
          <input aria-label="Name" {...form.register('name', { minLength: 5 })} />
          <ActionStateProbe mode="edit" pending={false} />
        </FormProvider>
      )
    }

    render(<Page />)

    await user.clear(screen.getByRole('textbox', { name: 'Name' }))
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Bad')

    expect(screen.getByTestId('action-state')).toHaveAttribute('data-submit-disabled', 'false')
  })
})
