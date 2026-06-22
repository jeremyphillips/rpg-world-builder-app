import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { FormUnsavedChangesGuard } from './form-unsaved-changes-guard'
import { renderWithDataRouter } from './test-router'

interface TestValues {
  name: string
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
})
