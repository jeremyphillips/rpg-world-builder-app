import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Form, type FormItem } from '@rpg/ui/form'

import { FormUnsavedChangesGuard } from './form-unsaved-changes-guard'
import { renderWithDataRouter } from './test-router'

interface TestValues {
  name: string
}

interface ConditionalTestValues {
  name: string
  showNotes: boolean
  notes: string
}

function DirtyForm() {
  const form = useForm<TestValues>({ defaultValues: { name: 'Original' } })

  return (
    <FormProvider {...form}>
      <FormUnsavedChangesGuard />
      <label htmlFor="name">Name</label>
      <input id="name" aria-label="Name" {...form.register('name')} />
      <Link to="/away">Leave</Link>
    </FormProvider>
  )
}

function ConditionalHiddenFieldForm() {
  const form = useForm<ConditionalTestValues>({
    defaultValues: { name: 'Original', showNotes: false, notes: 'seed' },
    shouldUnregister: true,
  })
  const showNotes = useWatch({ control: form.control, name: 'showNotes' })

  return (
    <FormProvider {...form}>
      <FormUnsavedChangesGuard />
      <label htmlFor="name">Name</label>
      <input id="name" aria-label="Name" {...form.register('name')} />
      <label htmlFor="show-notes">
        <input id="show-notes" type="checkbox" {...form.register('showNotes')} />
        Show notes
      </label>
      {showNotes ? (
        <>
          <label htmlFor="notes">Notes</label>
          <input id="notes" aria-label="Notes" {...form.register('notes')} />
        </>
      ) : null}
      <Link to="/away">Leave</Link>
    </FormProvider>
  )
}

function BackNavigationForm() {
  const navigate = useNavigate()
  const form = useForm<TestValues>({ defaultValues: { name: 'Original' } })

  return (
    <FormProvider {...form}>
      <FormUnsavedChangesGuard />
      <label htmlFor="name">Name</label>
      <input id="name" aria-label="Name" {...form.register('name')} />
      <button type="button" onClick={() => navigate(-1)}>
        Back
      </button>
    </FormProvider>
  )
}

function renderDirtyForm() {
  return renderWithDataRouter(
    [
      { path: '/form', element: <DirtyForm /> },
      { path: '/away', element: <div>Away page</div> },
    ],
    { initialEntries: ['/form'] },
  )
}

describe('FormUnsavedChangesGuard', () => {
  it('allows navigation when the form is clean', async () => {
    const user = userEvent.setup()
    renderDirtyForm()

    await user.click(screen.getByRole('link', { name: 'Leave' }))

    expect(await screen.findByText('Away page')).toBeInTheDocument()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('prompts before navigating away from a dirty form', async () => {
    const user = userEvent.setup()
    renderDirtyForm()

    await user.clear(screen.getByRole('textbox', { name: 'Name' }))
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Changed')
    await user.click(screen.getByRole('link', { name: 'Leave' }))

    expect(await screen.findByRole('alertdialog')).toBeInTheDocument()
    expect(screen.getByText('Discard changes?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Keep editing' })).toBeInTheDocument()
    expect(screen.queryByText('Away page')).not.toBeInTheDocument()
  })

  it('continues navigation when the user confirms discard', async () => {
    const user = userEvent.setup()
    renderDirtyForm()

    await user.clear(screen.getByRole('textbox', { name: 'Name' }))
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Changed')
    await user.click(screen.getByRole('link', { name: 'Leave' }))
    await user.click(await screen.findByRole('button', { name: 'Discard' }))

    expect(await screen.findByText('Away page')).toBeInTheDocument()
  })

  it('stays on the form when the user keeps editing', async () => {
    const user = userEvent.setup()
    renderDirtyForm()

    await user.clear(screen.getByRole('textbox', { name: 'Name' }))
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Changed')
    await user.click(screen.getByRole('link', { name: 'Leave' }))
    await user.click(await screen.findByRole('button', { name: 'Keep editing' }))

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Changed')
    expect(screen.queryByText('Away page')).not.toBeInTheDocument()
  })

  it('allows navigation when hidden unregistered fields make isDirty true without user edits', async () => {
    const user = userEvent.setup()
    renderWithDataRouter(
      [
        { path: '/form', element: <ConditionalHiddenFieldForm /> },
        { path: '/away', element: <div>Away page</div> },
      ],
      { initialEntries: ['/form'] },
    )

    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Original')
    await user.click(screen.getByRole('link', { name: 'Leave' }))

    expect(await screen.findByText('Away page')).toBeInTheDocument()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('allows navigation when an empty rich text description initializes without user edits', async () => {
    const user = userEvent.setup()
    const schema = z.object({
      name: z.string().min(1),
      description: z.string().optional(),
    })
    const fields: FormItem[] = [
      { type: 'text', name: 'name', label: 'Name', required: true },
      { type: 'richtext', name: 'description', label: 'Description' },
    ]

    renderWithDataRouter(
      [
        {
          path: '/form',
          element: (
            <Form
              schema={schema}
              fields={fields}
              defaultValues={{ name: 'Test item', description: undefined }}
              onSubmit={() => undefined}
              footer={() => (
                <>
                  <FormUnsavedChangesGuard />
                  <Link to="/away">Leave</Link>
                </>
              )}
            />
          ),
        },
        { path: '/away', element: <div>Away page</div> },
      ],
      { initialEntries: ['/form'] },
    )

    await screen.findByRole('textbox', { name: 'Description' })
    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Leave' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('link', { name: 'Leave' }))

    expect(await screen.findByText('Away page')).toBeInTheDocument()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('allows navigation when a plain-text catalog description initializes without user edits', async () => {
    const user = userEvent.setup()
    const schema = z.object({
      name: z.string().min(1),
      slug: z.string().optional(),
      description: z.string().optional(),
    })
    const fields: FormItem[] = [
      { type: 'text', name: 'name', label: 'Name', required: true },
      { type: 'richtext', name: 'description', label: 'Description' },
    ]

    renderWithDataRouter(
      [
        {
          path: '/form',
          element: (
            <Form
              schema={schema}
              fields={fields}
              defaultValues={{
                name: 'Athletics',
                description:
                  'Jump farther than normal, stay afloat in rough water, or break something.',
              }}
              onSubmit={() => undefined}
              footer={() => (
                <>
                  <FormUnsavedChangesGuard />
                  <Link to="/away">Leave</Link>
                </>
              )}
            />
          ),
        },
        { path: '/away', element: <div>Away page</div> },
      ],
      { initialEntries: ['/form'] },
    )

    await screen.findByRole('textbox', { name: 'Description' })
    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Leave' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('link', { name: 'Leave' }))

    expect(await screen.findByText('Away page')).toBeInTheDocument()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('continues POP back navigation when the user confirms discard', async () => {
    const user = userEvent.setup()
    renderWithDataRouter(
      [
        { path: '/start', element: <div>Start page</div> },
        { path: '/form', element: <BackNavigationForm /> },
      ],
      { initialEntries: ['/start', '/form'], initialIndex: 1 },
    )

    await user.clear(screen.getByRole('textbox', { name: 'Name' }))
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Changed')
    await user.click(screen.getByRole('button', { name: 'Back' }))
    await user.click(await screen.findByRole('button', { name: 'Discard' }))

    expect(await screen.findByText('Start page')).toBeInTheDocument()
  })
})
