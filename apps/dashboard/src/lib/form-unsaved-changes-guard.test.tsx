import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import {
  FormProvider,
  useForm,
  useFormState,
  useWatch,
  type DefaultValues,
  type FieldValues,
} from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z, type ZodType } from 'zod'
import { Form, type FormItem } from '@rpg/ui/form'

import { FormUnsavedChangesGuard, useUnsavedChangesConfirm } from './form-unsaved-changes-guard'
import { hasDirtyFields } from './form-dirty-state'
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

function PostSaveLeaveGuard({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const { dirtyFields } = useFormState()
  const discardGuard = useUnsavedChangesConfirm({
    isDirty: hasDirtyFields(dirtyFields),
  })

  return (
    <>
      {discardGuard.dialog}
      <FormUnsavedChangesGuard discardGuard={discardGuard} renderDialog={false} />
      <button
        type="button"
        onClick={() => {
          discardGuard.runTrusted(() => navigate('/away'))
        }}
      >
        Save and leave
      </button>
    </>
  )
}

function PostSaveNavigationForm() {
  const navigate = useNavigate()
  const form = useForm<TestValues>({ defaultValues: { name: 'Original' } })

  return (
    <FormProvider {...form}>
      <PostSaveLeaveGuard navigate={navigate} />
      <label htmlFor="name">Name</label>
      <input id="name" aria-label="Name" {...form.register('name')} />
    </FormProvider>
  )
}

function DirtyFormWithExtraFalse() {
  const form = useForm<TestValues>({ defaultValues: { name: 'Original' } })

  return (
    <FormProvider {...form}>
      <FormUnsavedChangesGuard extraUnsavedEdits={false} />
      <label htmlFor="name">Name</label>
      <input id="name" aria-label="Name" {...form.register('name')} />
      <Link to="/away">Leave</Link>
    </FormProvider>
  )
}

function CleanFormWithExtraTrue() {
  const form = useForm<TestValues>({ defaultValues: { name: 'Original' } })

  return (
    <FormProvider {...form}>
      <FormUnsavedChangesGuard extraUnsavedEdits />
      <label htmlFor="name">Name</label>
      <input id="name" aria-label="Name" {...form.register('name')} />
      <Link to="/away">Leave</Link>
    </FormProvider>
  )
}

function PendingForm() {
  const form = useForm<TestValues>({ defaultValues: { name: 'Original' } })

  return (
    <FormProvider {...form}>
      <FormUnsavedChangesGuard pending />
      <label htmlFor="name">Name</label>
      <input id="name" aria-label="Name" {...form.register('name')} />
      <Link to="/away">Leave</Link>
    </FormProvider>
  )
}

function renderFormRoute(element: ReactElement) {
  return renderWithDataRouter(
    [
      { path: '/form', element },
      { path: '/away', element: <div>Away page</div> },
    ],
    { initialEntries: ['/form'] },
  )
}

function renderDirtyForm() {
  return renderFormRoute(<DirtyForm />)
}

const guardedRichTextFields: FormItem[] = [
  { type: 'text', name: 'name', label: 'Name', required: true },
  { type: 'richtext', name: 'description', label: 'Description' },
]

function renderGuardedRichTextForm<TValues extends FieldValues>(
  schema: ZodType<TValues>,
  defaultValues: DefaultValues<TValues>,
) {
  return renderFormRoute(
    <Form
      schema={schema}
      fields={guardedRichTextFields}
      defaultValues={defaultValues}
      onSubmit={() => undefined}
      footer={() => (
        <>
          <FormUnsavedChangesGuard />
          <Link to="/away">Leave</Link>
        </>
      )}
    />,
  )
}

async function awaitGuardedRichTextFormReady() {
  await screen.findByRole('textbox', { name: 'Description' })
  await waitFor(() => {
    expect(screen.getByRole('link', { name: 'Leave' })).toBeInTheDocument()
  })
}

async function editNameToChanged(user: UserEvent) {
  await user.clear(screen.getByRole('textbox', { name: 'Name' }))
  await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Changed')
}

async function leaveAndExpectAwayWithoutPrompt(user: UserEvent) {
  await user.click(screen.getByRole('link', { name: 'Leave' }))

  expect(await screen.findByText('Away page')).toBeInTheDocument()
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
}

describe('FormUnsavedChangesGuard', () => {
  it('allows navigation when the form is clean', async () => {
    const user = userEvent.setup()
    renderDirtyForm()

    await leaveAndExpectAwayWithoutPrompt(user)
  })

  it('prompts before navigating away from a dirty form', async () => {
    const user = userEvent.setup()
    renderDirtyForm()

    await editNameToChanged(user)
    await user.click(screen.getByRole('link', { name: 'Leave' }))

    expect(await screen.findByRole('alertdialog')).toBeInTheDocument()
    expect(screen.getByText('Discard changes?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Keep editing' })).toBeInTheDocument()
    expect(screen.queryByText('Away page')).not.toBeInTheDocument()
  })

  it('continues navigation when the user confirms discard', async () => {
    const user = userEvent.setup()
    renderDirtyForm()

    await editNameToChanged(user)
    await user.click(screen.getByRole('link', { name: 'Leave' }))
    await user.click(await screen.findByRole('button', { name: 'Discard' }))

    expect(await screen.findByText('Away page')).toBeInTheDocument()
  })

  it('stays on the form when the user keeps editing', async () => {
    const user = userEvent.setup()
    renderDirtyForm()

    await editNameToChanged(user)
    await user.click(screen.getByRole('link', { name: 'Leave' }))
    await user.click(await screen.findByRole('button', { name: 'Keep editing' }))

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Changed')
    expect(screen.queryByText('Away page')).not.toBeInTheDocument()
  })

  it('allows navigation when hidden unregistered fields make isDirty true without user edits', async () => {
    const user = userEvent.setup()
    renderFormRoute(<ConditionalHiddenFieldForm />)

    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Original')
    await leaveAndExpectAwayWithoutPrompt(user)
  })

  it('allows navigation when an empty rich text description initializes without user edits', async () => {
    const user = userEvent.setup()
    const schema = z.object({
      name: z.string().min(1),
      description: z.string().optional(),
    })

    renderGuardedRichTextForm(schema, { name: 'Test item', description: undefined })
    await awaitGuardedRichTextFormReady()

    await leaveAndExpectAwayWithoutPrompt(user)
  })

  it('allows navigation when a plain-text catalog description initializes without user edits', async () => {
    const user = userEvent.setup()
    const schema = z.object({
      name: z.string().min(1),
      slug: z.string().optional(),
      description: z.string().optional(),
    })

    renderGuardedRichTextForm(schema, {
      name: 'Athletics',
      description: 'Jump farther than normal, stay afloat in rough water, or break something.',
    })
    await awaitGuardedRichTextFormReady()

    await leaveAndExpectAwayWithoutPrompt(user)
  })

  it('allows trusted navigation while the form is still dirty', async () => {
    const user = userEvent.setup()
    renderFormRoute(<PostSaveNavigationForm />)

    await editNameToChanged(user)
    await user.click(screen.getByRole('button', { name: 'Save and leave' }))

    expect(await screen.findByText('Away page')).toBeInTheDocument()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('still prompts when extraUnsavedEdits is false but body fields are dirty', async () => {
    const user = userEvent.setup()
    renderFormRoute(<DirtyFormWithExtraFalse />)

    await editNameToChanged(user)
    await user.click(screen.getByRole('link', { name: 'Leave' }))

    expect(await screen.findByRole('alertdialog')).toBeInTheDocument()
  })

  it('prompts when extraUnsavedEdits is true even if body fields are clean', async () => {
    const user = userEvent.setup()
    renderFormRoute(<CleanFormWithExtraTrue />)

    await user.click(screen.getByRole('link', { name: 'Leave' }))

    expect(await screen.findByRole('alertdialog')).toBeInTheDocument()
  })

  it('allows navigation after reverting dirty fields to their baseline', async () => {
    const user = userEvent.setup()
    renderDirtyForm()

    await editNameToChanged(user)
    await user.clear(screen.getByRole('textbox', { name: 'Name' }))
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Original')
    await leaveAndExpectAwayWithoutPrompt(user)
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

    await editNameToChanged(user)
    await user.click(screen.getByRole('button', { name: 'Back' }))
    await user.click(await screen.findByRole('button', { name: 'Discard' }))

    expect(await screen.findByText('Start page')).toBeInTheDocument()
  })

  it('blocks navigation while pending without opening the discard dialog', async () => {
    const user = userEvent.setup()
    renderFormRoute(<PendingForm />)

    await user.click(screen.getByRole('link', { name: 'Leave' }))

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(screen.queryByText('Away page')).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Original')
  })
})
