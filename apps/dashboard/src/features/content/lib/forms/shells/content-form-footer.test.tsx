import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, type FieldValues } from 'react-hook-form'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { renderWithDataRouter } from '@/lib/test-router'
import { ContentFormFooter } from './content-form-footer'

function renderCreateFooter({
  pending = false,
  defaultValues = { name: 'Fireball' },
}: {
  pending?: boolean
  defaultValues?: FieldValues
} = {}) {
  function FooterPage() {
    const form = useForm({ defaultValues, mode: 'onChange' })

    return (
      <FormProvider {...form}>
        <form>
          <ContentFormFooter
            mode="create"
            form={form}
            backHref="/overview"
            submitLabel="Create spell"
            pending={pending}
          />
        </form>
      </FormProvider>
    )
  }

  return renderWithDataRouter([{ path: '/', element: <FooterPage /> }])
}

function renderEditFooter({
  pending = false,
  isSuccess = false,
}: {
  pending?: boolean
  isSuccess?: boolean
} = {}) {
  function FooterPage() {
    const form = useForm({ defaultValues: { name: 'Fireball' }, mode: 'onChange' })

    return (
      <FormProvider {...form}>
        <form>
          <input aria-label="Name" {...form.register('name')} />
          <ContentFormFooter
            mode="edit"
            form={form}
            submitLabel="Save changes"
            pending={pending}
            isSuccess={isSuccess}
          />
        </form>
      </FormProvider>
    )
  }

  return renderWithDataRouter([{ path: '/', element: <FooterPage /> }])
}

describe('ContentFormFooter', () => {
  it('renders Cancel and create submit on create mode', async () => {
    renderCreateFooter()

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Create spell' })).toBeEnabled()
    })
  })

  it('disables create submit while pending', () => {
    renderCreateFooter({ pending: true })

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Creating…' })).toBeDisabled()
  })

  it('renders Discard changes disabled until the form is dirty', async () => {
    const user = userEvent.setup()
    renderEditFooter()

    expect(screen.getByRole('button', { name: 'Discard changes' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled()

    await user.clear(screen.getByRole('textbox', { name: 'Name' }))
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Modified')

    expect(screen.getByRole('button', { name: 'Discard changes' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled()
  })

  it('announces inline saved feedback on edit success', () => {
    renderEditFooter({ isSuccess: true })

    expect(screen.getByRole('status')).toHaveTextContent('Changes saved.')
  })

  it('resets dirty state when Discard changes is clicked', async () => {
    const user = userEvent.setup()
    const resetSpy = vi.fn()

    function FooterPage() {
      const form = useForm({ defaultValues: { name: 'Fireball' }, mode: 'onChange' })
      const reset = form.reset
      form.reset = (...args) => {
        resetSpy(...args)
        reset(...args)
      }

      return (
        <FormProvider {...form}>
          <form>
            <input aria-label="Name" {...form.register('name')} />
            <ContentFormFooter mode="edit" form={form} submitLabel="Save changes" pending={false} />
          </form>
        </FormProvider>
      )
    }

    renderWithDataRouter([{ path: '/', element: <FooterPage /> }])
    await user.clear(screen.getByRole('textbox', { name: 'Name' }))
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Modified')
    await user.click(screen.getByRole('button', { name: 'Discard changes' }))

    expect(resetSpy).toHaveBeenCalled()
  })

  it('has no axe violations in create mode', async () => {
    const { container } = renderCreateFooter()
    await expectNoAxeViolations(container)
  })
})
