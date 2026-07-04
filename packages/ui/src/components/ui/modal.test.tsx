import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { Modal } from './modal.client'
import { Button } from './button.client'
import { ConfirmDialog } from './confirm-dialog.client'
import { useModal } from '../../hooks/use-modal'

function renderModal(contentProps: Record<string, unknown> = {}) {
  return render(
    <Modal.Root>
      <Modal.Trigger asChild>
        <Button>Open</Button>
      </Modal.Trigger>
      <Modal.Content {...contentProps}>
        <Modal.Header headline="Invite a player" description="They will receive an email." />
        <Modal.Body>Body content</Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button>Cancel</Button>
          </Modal.Close>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>,
  )
}

describe('Modal', () => {
  it('opens from the trigger and renders headline + description', async () => {
    const user = userEvent.setup()
    renderModal()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Open' }))

    const dialog = await screen.findByRole('dialog', { name: 'Invite a player' })
    expect(dialog).toHaveTextContent('They will receive an email.')
  })

  it('closes via a Modal.Close footer button', async () => {
    const user = userEvent.setup()
    renderModal()
    await user.click(screen.getByRole('button', { name: 'Open' }))
    await screen.findByRole('dialog')

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes on Escape by default', async () => {
    const user = userEvent.setup()
    renderModal()
    await user.click(screen.getByRole('button', { name: 'Open' }))
    await screen.findByRole('dialog')

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('stays open on Escape when closeOnEscape is false', async () => {
    const user = userEvent.setup()
    renderModal({ closeOnEscape: false })
    await user.click(screen.getByRole('button', { name: 'Open' }))
    await screen.findByRole('dialog')

    await user.keyboard('{Escape}')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('stays open on outside click when closeOnOutsideClick is false', async () => {
    const user = userEvent.setup()
    renderModal({ closeOnOutsideClick: false })
    await user.click(screen.getByRole('button', { name: 'Open' }))
    await screen.findByRole('dialog')

    // Radix locks `pointer-events` on the body while open, so dispatch the
    // outside pointerdown directly (userEvent guards against it otherwise).
    fireEvent.pointerDown(document.body)
    fireEvent.pointerUp(document.body)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('has no axe accessibility violations when open', async () => {
    const user = userEvent.setup()
    renderModal()
    await user.click(screen.getByRole('button', { name: 'Open' }))
    await screen.findByRole('dialog')

    await expectNoAxeViolations(document.body)
  })
})

function GuardedModal({ shouldConfirmClose }: { shouldConfirmClose: boolean }) {
  const modal = useModal({ shouldConfirmClose })
  return (
    <>
      <Button onClick={modal.openModal}>Open</Button>
      <Modal.Root open={modal.open} onOpenChange={modal.onOpenChange}>
        <Modal.Content>
          <Modal.Header headline="Edit campaign" />
          <Modal.Body>Body</Modal.Body>
        </Modal.Content>
      </Modal.Root>
      <ConfirmDialog
        open={modal.confirmingClose}
        onOpenChange={(next) => !next && modal.cancelClose()}
        headline="Discard changes?"
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        onConfirm={modal.confirmCloseAndExit}
        onCancel={modal.cancelClose}
      />
    </>
  )
}

describe('Modal guarded close', () => {
  it('intercepts the X button and opens the confirmation when dirty', async () => {
    const user = userEvent.setup()
    render(<GuardedModal shouldConfirmClose />)
    await user.click(screen.getByRole('button', { name: 'Open' }))
    await screen.findByRole('dialog')

    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(await screen.findByRole('alertdialog', { name: 'Discard changes?' })).toBeInTheDocument()
    // The modal is still mounted underneath (Radix marks it aria-hidden while the
    // alertdialog is on top), so query by its text rather than the dialog role.
    expect(screen.getByText('Edit campaign')).toBeInTheDocument()
  })

  it('keeps editing when the guard is cancelled', async () => {
    const user = userEvent.setup()
    render(<GuardedModal shouldConfirmClose />)
    await user.click(screen.getByRole('button', { name: 'Open' }))
    await user.keyboard('{Escape}')

    await user.click(await screen.findByRole('button', { name: 'Keep editing' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('closes both when the guard is confirmed', async () => {
    const user = userEvent.setup()
    render(<GuardedModal shouldConfirmClose />)
    await user.click(screen.getByRole('button', { name: 'Open' }))
    await user.keyboard('{Escape}')

    await user.click(await screen.findByRole('button', { name: 'Discard' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes immediately when not dirty', async () => {
    const user = userEvent.setup()
    render(<GuardedModal shouldConfirmClose={false} />)
    await user.click(screen.getByRole('button', { name: 'Open' }))
    await screen.findByRole('dialog')

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })
})
