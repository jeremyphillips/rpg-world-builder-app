import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { ContentFormDrawer } from './content-form-drawer.client'

const schema = z.object({ name: z.string().min(1) })

describe('ContentFormDrawer', () => {
  it('disables cancel and submit while pending', () => {
    render(
      <ContentFormDrawer
        open
        onOpenChange={() => undefined}
        title="Add item"
        pending
        submitLabel="Create"
        form={{
          schema,
          fields: [{ type: 'text', name: 'name', label: 'Name' }],
          defaultValues: { name: '' },
        }}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled()
  })

  it('surfaces formError from the shell', () => {
    render(
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

    render(
      <ContentFormDrawer
        open
        onOpenChange={onOpenChange}
        title="Add item"
        pending
        submitLabel="Create"
        form={{
          schema,
          fields: [{ type: 'text', name: 'name', label: 'Name' }],
          defaultValues: { name: '' },
        }}
        onSubmit={vi.fn()}
      />,
    )

    await user.keyboard('{Escape}')
    expect(onOpenChange).not.toHaveBeenCalled()
  })
})
