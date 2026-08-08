import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { ConfirmDialog } from './confirm-dialog.client'

function renderConfirm(props: Partial<ComponentProps<typeof ConfirmDialog>> = {}) {
  const onConfirm = vi.fn()
  const onCancel = vi.fn()
  const onOpenChange = vi.fn()
  render(
    <ConfirmDialog
      open
      onOpenChange={onOpenChange}
      headline="Delete campaign?"
      description="This cannot be undone."
      confirmLabel="Delete"
      cancelLabel="Keep"
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...props}
    />,
  )
  return { onConfirm, onCancel, onOpenChange }
}

describe('ConfirmDialog', () => {
  it('renders as an alertdialog with headline and description', () => {
    renderConfirm()
    const dialog = screen.getByRole('alertdialog', { name: 'Delete campaign?' })
    expect(dialog).toHaveTextContent('This cannot be undone.')
    expect(dialog).toHaveFocus()
  })

  it('fires onConfirm when the confirm button is pressed', async () => {
    const user = userEvent.setup()
    const { onConfirm } = renderConfirm()
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('fires onCancel when the cancel button is pressed', async () => {
    const user = userEvent.setup()
    const { onCancel } = renderConfirm()
    await user.click(screen.getByRole('button', { name: 'Keep' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  itAxe('has no axe accessibility violations', async () => {
    renderConfirm()
    await expectNoAxeViolations(document.body)
  })
})
