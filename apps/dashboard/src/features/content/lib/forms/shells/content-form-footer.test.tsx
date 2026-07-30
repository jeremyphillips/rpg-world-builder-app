import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, type FieldValues } from 'react-hook-form'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { Form } from '@rpg/ui/form'
import { z } from 'zod'

import { renderWithDataRouter } from '@/lib/test-router'
import { ContentFormFooter } from './content-form-footer'

const createSchema = z.object({
  name: z.string().min(1, 'Name is required'),
})

type CreateValues = z.infer<typeof createSchema>

const createFields = [{ type: 'text' as const, name: 'name', label: 'Name', required: true }]

function renderCreateFooter({
  pending = false,
  defaultValues = { name: 'Fireball' },
}: {
  pending?: boolean
  defaultValues?: FieldValues
} = {}) {
  return renderWithDataRouter([
    {
      path: '/',
      element: (
        <Form<CreateValues>
          schema={createSchema}
          fields={createFields}
          defaultValues={defaultValues as CreateValues}
          onSubmit={vi.fn()}
          stickyFooter
          footer={(form) => (
            <ContentFormFooter
              mode="create"
              form={form}
              backHref="/overview"
              submitLabel="Create spell"
              pending={pending}
            />
          )}
        />
      ),
    },
  ])
}

function renderEditFooter({ pending = false }: { pending?: boolean } = {}) {
  function FooterPage() {
    const form = useForm({ defaultValues: { name: 'Fireball' } })

    return (
      <FormProvider {...form}>
        <form>
          <input aria-label="Name" {...form.register('name')} />
          <ContentFormFooter mode="edit" form={form} submitLabel="Save changes" pending={pending} />
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
      expect(screen.getByRole('button', { name: 'Publish' })).toBeEnabled()
    })
  })

  it('renders Save draft when onSaveDraft is provided', async () => {
    renderWithDataRouter([
      {
        path: '/',
        element: (
          <Form<CreateValues>
            schema={createSchema}
            fields={createFields}
            defaultValues={{ name: 'Fireball' }}
            onSubmit={vi.fn()}
            stickyFooter
            footer={(form) => (
              <ContentFormFooter
                mode="create"
                form={form}
                backHref="/overview"
                submitLabel="Create spell"
                pending={false}
                onSaveDraft={vi.fn()}
              />
            )}
          />
        ),
      },
    ])

    expect(screen.getByRole('button', { name: 'Save draft' })).toBeInTheDocument()
  })

  it('does not call form.trigger on create mount', async () => {
    const triggerSpy = vi.fn()

    renderWithDataRouter([
      {
        path: '/',
        element: (
          <Form<CreateValues>
            schema={createSchema}
            fields={createFields}
            defaultValues={{ name: 'Fireball' }}
            onSubmit={vi.fn()}
            footer={(form) => {
              triggerSpy.mockImplementation(form.trigger)
              return (
                <ContentFormFooter
                  mode="create"
                  form={form}
                  submitLabel="Create spell"
                  pending={false}
                />
              )
            }}
          />
        ),
      },
    ])

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Publish' })).toBeEnabled()
    })
    expect(triggerSpy).not.toHaveBeenCalled()
  })

  it('keeps create submit enabled with invalid defaults so click reveals errors', async () => {
    renderCreateFooter({ defaultValues: { name: '' } })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Publish' })).toBeEnabled()
    })
  })

  it('disables create submit while pending', () => {
    renderCreateFooter({ pending: true })

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Publishing…' })).toBeDisabled()
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

  it('keeps Save enabled when edit is dirty but invalid', async () => {
    const user = userEvent.setup()

    function FooterPage() {
      const form = useForm({ defaultValues: { name: 'Fireball' } })

      return (
        <FormProvider {...form}>
          <form>
            <input aria-label="Name" {...form.register('name', { minLength: 10 })} />
            <ContentFormFooter mode="edit" form={form} submitLabel="Save changes" pending={false} />
          </form>
        </FormProvider>
      )
    }

    renderWithDataRouter([{ path: '/', element: <FooterPage /> }])

    await user.clear(screen.getByRole('textbox', { name: 'Name' }))
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Short')

    expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled()
  })

  it('does not announce inline saved feedback on edit success', () => {
    renderEditFooter()

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('resets dirty state when Discard changes is clicked', async () => {
    const user = userEvent.setup()
    const resetSpy = vi.fn()

    function FooterPage() {
      const form = useForm({ defaultValues: { name: 'Fireball' } })
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

describe('content edit post-save baseline', () => {
  it('resets the form from saved entity values, not the submitted client payload', () => {
    const reset = vi.fn()
    const savedEntity = { id: '1', name: 'Server Normalized', slug: 'server-normalized' }
    const clientValues = { name: 'Client Typed', slug: 'client-typed' }

    const def = {
      toFormValues: (entity: typeof savedEntity) => ({
        name: entity.name,
        slug: entity.slug,
      }),
    }

    const baseline = def.toFormValues(savedEntity)
    reset(baseline)

    expect(reset).toHaveBeenCalledWith({
      name: 'Server Normalized',
      slug: 'server-normalized',
    })
    expect(reset).not.toHaveBeenCalledWith(clientValues)
  })
})
