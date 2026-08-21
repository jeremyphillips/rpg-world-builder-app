import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { renderWithDataRouter } from '@/lib/test-router'
import { ContentFormDrawer } from './content-form-drawer'

const schema = z.object({ name: z.string().min(1) })

const formProps = {
  schema,
  fields: [{ type: 'text' as const, name: 'name', label: 'Name' }],
  defaultValues: { name: 'Original' },
}

function renderDrawerRoutes(
  element: ReactElement,
  { initialEntries = ['/page'] }: { initialEntries?: string[] } = {},
) {
  return renderWithDataRouter(
    [
      { path: '/page', element },
      { path: '/away', element: <div>Away page</div> },
    ],
    { initialEntries },
  )
}

describe('ContentFormDrawer', () => {
  it('disables cancel and submit while pending', () => {
    renderDrawerRoutes(
      <ContentFormDrawer
        open
        onOpenChange={() => undefined}
        title="Add item"
        pending
        submitLabel="Create"
        form={formProps}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled()
  })

  it('surfaces formError from the shell', () => {
    renderDrawerRoutes(
      <ContentFormDrawer
        open
        onOpenChange={() => undefined}
        title="Add item"
        pending={false}
        submitLabel="Create"
        formError="Could not save."
        form={{
          schema,
          fields: [{ type: 'text', name: 'name', label: 'Name' }],
          defaultValues: { name: '' },
        }}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByText('Could not save.')).toBeInTheDocument()
  })

  it('blocks dismiss while pending', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    renderDrawerRoutes(
      <ContentFormDrawer
        open
        onOpenChange={onOpenChange}
        title="Add item"
        pending
        submitLabel="Create"
        form={formProps}
        onSubmit={vi.fn()}
      />,
    )

    await user.keyboard('{Escape}')
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('prompts before closing a dirty drawer', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    renderDrawerRoutes(
      <ContentFormDrawer
        open
        onOpenChange={onOpenChange}
        title="Add item"
        pending={false}
        submitLabel="Create"
        form={formProps}
        onSubmit={vi.fn()}
      />,
    )

    await user.clear(screen.getByRole('textbox', { name: 'Name' }))
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Changed')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(await screen.findByRole('alertdialog')).toBeInTheDocument()
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('prompts before closing when extraUnsavedEdits is true even if body fields are clean', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    renderDrawerRoutes(
      <ContentFormDrawer
        open
        onOpenChange={onOpenChange}
        title="Add item"
        pending={false}
        submitLabel="Create"
        extraUnsavedEdits
        form={formProps}
        onSubmit={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(await screen.findByRole('alertdialog')).toBeInTheDocument()
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('closes the drawer when discard is confirmed', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    renderDrawerRoutes(
      <ContentFormDrawer
        open
        onOpenChange={onOpenChange}
        title="Add item"
        pending={false}
        submitLabel="Create"
        form={formProps}
        onSubmit={vi.fn()}
      />,
    )

    await user.clear(screen.getByRole('textbox', { name: 'Name' }))
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Changed')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    await user.click(await screen.findByRole('button', { name: 'Discard' }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('keeps the drawer open when keep editing is chosen', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    renderDrawerRoutes(
      <ContentFormDrawer
        open
        onOpenChange={onOpenChange}
        title="Add item"
        pending={false}
        submitLabel="Create"
        form={formProps}
        onSubmit={vi.fn()}
      />,
    )

    await user.clear(screen.getByRole('textbox', { name: 'Name' }))
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Changed')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    await user.click(await screen.findByRole('button', { name: 'Keep editing' }))

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Changed')
  })

  it('closes without discard confirmation after a successful create', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    renderDrawerRoutes(
      <ContentFormDrawer
        open
        onOpenChange={onOpenChange}
        title="Add item"
        pending={false}
        submitLabel="Create"
        form={formProps}
        onSubmit={onSubmit}
      />,
    )

    await user.clear(screen.getByRole('textbox', { name: 'Name' }))
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Changed')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('closes without discard confirmation when extraUnsavedEdits is true but submit succeeds', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    renderDrawerRoutes(
      <ContentFormDrawer
        open
        onOpenChange={onOpenChange}
        title="Add item"
        pending={false}
        submitLabel="Create"
        extraUnsavedEdits
        form={formProps}
        onSubmit={onSubmit}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('prompts before route navigation when the drawer form is dirty', async () => {
    const user = userEvent.setup()

    function LeavePageButton() {
      const navigate = useNavigate()
      return (
        <button type="button" onClick={() => navigate('/away')}>
          Leave page
        </button>
      )
    }

    renderDrawerRoutes(
      <>
        <ContentFormDrawer
          open
          onOpenChange={() => undefined}
          title="Add item"
          pending={false}
          submitLabel="Create"
          form={formProps}
          onSubmit={vi.fn()}
        />
        <LeavePageButton />
      </>,
    )

    await user.clear(screen.getByRole('textbox', { name: 'Name' }))
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Changed')
    fireEvent.click(screen.getByRole('button', { name: 'Leave page', hidden: true }))

    expect(await screen.findByRole('alertdialog')).toBeInTheDocument()
    expect(screen.queryByText('Away page')).not.toBeInTheDocument()
  })

  it('allows closing when fields are reverted to clean', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    renderDrawerRoutes(
      <ContentFormDrawer
        open
        onOpenChange={onOpenChange}
        title="Add item"
        pending={false}
        submitLabel="Create"
        form={formProps}
        onSubmit={vi.fn()}
      />,
    )

    await user.clear(screen.getByRole('textbox', { name: 'Name' }))
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Changed')
    await user.clear(screen.getByRole('textbox', { name: 'Name' }))
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Original')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('closes only after onSubmit settles', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    let resolveSubmit: (() => void) | undefined
    const onSubmit = vi.fn().mockReturnValue(
      new Promise<void>((resolve) => {
        resolveSubmit = resolve
      }),
    )

    renderDrawerRoutes(
      <ContentFormDrawer
        open
        onOpenChange={onOpenChange}
        title="Add item"
        pending={false}
        submitLabel="Create"
        form={formProps}
        onSubmit={onSubmit}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(onOpenChange).not.toHaveBeenCalled()

    resolveSubmit?.()
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('keeps the drawer open when onSubmit rejects', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const onSubmit = vi.fn().mockRejectedValue(new Error('Save failed'))

    renderDrawerRoutes(
      <ContentFormDrawer
        open
        onOpenChange={onOpenChange}
        title="Add item"
        pending={false}
        submitLabel="Create"
        form={formProps}
        onSubmit={onSubmit}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('blocks route navigation while pending without discard dialog', async () => {
    const user = userEvent.setup()

    function LeavePageButton() {
      const navigate = useNavigate()
      return (
        <button type="button" onClick={() => navigate('/away')}>
          Leave page
        </button>
      )
    }

    renderDrawerRoutes(
      <>
        <ContentFormDrawer
          open
          onOpenChange={() => undefined}
          title="Add item"
          pending
          submitLabel="Create"
          form={formProps}
          onSubmit={vi.fn()}
        />
        <LeavePageButton />
      </>,
    )

    await user.clear(screen.getByRole('textbox', { name: 'Name' }))
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Changed')
    fireEvent.click(screen.getByRole('button', { name: 'Leave page', hidden: true }))

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(screen.queryByText('Away page')).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Changed')
  })
})
