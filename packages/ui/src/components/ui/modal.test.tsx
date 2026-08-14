import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { Modal } from './modal.client'
import { Button } from './button.client'
import { dialogPanelActionRowClasses } from './dialog-panel.variants'
import { modalStableBlockSizeClasses, modalStableTallBlockSizeClasses } from './modal.variants'
import { ConfirmDialog } from './confirm-dialog.client'
import { InfoTooltip } from './tooltip.client'
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
          <div className={dialogPanelActionRowClasses}>
            <Modal.Close asChild>
              <Button>Cancel</Button>
            </Modal.Close>
          </div>
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

  itAxe('has no axe accessibility violations when open', async () => {
    const user = userEvent.setup()
    renderModal()
    await user.click(screen.getByRole('button', { name: 'Open' }))
    await screen.findByRole('dialog')

    await expectNoAxeViolations(document.body)
  })

  it('focuses the dialog panel on open without opening label info tooltips', async () => {
    const user = userEvent.setup()
    render(
      <Modal.Root>
        <Modal.Trigger asChild>
          <Button>Open</Button>
        </Modal.Trigger>
        <Modal.Content>
          <Modal.Header headline="Edit availability" />
          <Modal.Body>
            <label htmlFor="availability">
              Availability
              <InfoTooltip aria-label="About Availability">Tooltip body</InfoTooltip>
            </label>
            <button id="availability" type="button" role="combobox">
              Leave unchanged
            </button>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>,
    )

    await user.click(screen.getByRole('button', { name: 'Open' }))
    const dialog = await screen.findByRole('dialog')

    expect(dialog).toHaveFocus()
    expect(document.getElementById('availability')).not.toHaveFocus()
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('applies stable body layout classes when stableBody is set', async () => {
    const user = userEvent.setup()
    render(
      <Modal.Root>
        <Modal.Trigger asChild>
          <Button>Open</Button>
        </Modal.Trigger>
        <Modal.Content>
          <Modal.Header headline="Stable body" />
          <Modal.Body stableBody data-testid="modal-body">
            Scrollable region
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>,
    )

    await user.click(screen.getByRole('button', { name: 'Open' }))
    const body = await screen.findByTestId('modal-body')
    expect(body).toHaveClass('overflow-hidden')
    expect(body).toHaveClass('flex-1')
    expect(body).toHaveClass('pb-0')
    expect(body).toHaveClass('px-6')
    expect(body).not.toHaveClass('overflow-y-auto')
  })

  it('keeps default body shrinkable and panel chrome pinned', async () => {
    const user = userEvent.setup()
    renderModal()

    await user.click(screen.getByRole('button', { name: 'Open' }))

    const dialog = await screen.findByRole('dialog', { name: 'Invite a player' })
    const body = within(dialog).getByText('Body content')
    const footer = within(dialog).getByRole('button', { name: 'Cancel' }).parentElement
      ?.parentElement
    const header = within(dialog).getByRole('heading', { name: 'Invite a player' }).parentElement
      ?.parentElement

    expect(body).toHaveClass('min-h-0', 'overflow-y-auto')
    expect(header).toHaveClass('shrink-0')
    expect(footer).toHaveClass('shrink-0')
  })

  it('applies the stable layout block-size token without changing default content layout', async () => {
    const user = userEvent.setup()
    render(
      <Modal.Root>
        <Modal.Trigger asChild>
          <Button>Open</Button>
        </Modal.Trigger>
        <Modal.Content layout="stable" data-testid="modal-content">
          <Modal.Header headline="Stable layout" />
          <Modal.Body>Short body</Modal.Body>
        </Modal.Content>
      </Modal.Root>,
    )

    await user.click(screen.getByRole('button', { name: 'Open' }))
    const content = await screen.findByTestId('modal-content')
    expect(content.className).toContain(modalStableBlockSizeClasses)
    expect(content.className).toContain('max-h-[85vh]')
  })

  it('applies default stable size explicitly the same as implicit stable layout', async () => {
    const user = userEvent.setup()
    render(
      <Modal.Root>
        <Modal.Trigger asChild>
          <Button>Open</Button>
        </Modal.Trigger>
        <Modal.Content layout="stable" stableSize="default" data-testid="modal-content">
          <Modal.Header headline="Stable default" />
          <Modal.Body>Short body</Modal.Body>
        </Modal.Content>
      </Modal.Root>,
    )

    await user.click(screen.getByRole('button', { name: 'Open' }))
    const content = await screen.findByTestId('modal-content')
    expect(content.className).toContain(modalStableBlockSizeClasses)
    expect(content.className).toContain('max-h-[85vh]')
  })

  it('applies tall stable size with overridden max-height cap', async () => {
    const user = userEvent.setup()
    render(
      <Modal.Root>
        <Modal.Trigger asChild>
          <Button>Open</Button>
        </Modal.Trigger>
        <Modal.Content layout="stable" stableSize="tall" data-testid="modal-content">
          <Modal.Header headline="Stable tall" />
          <Modal.Body>Short body</Modal.Body>
        </Modal.Content>
      </Modal.Root>,
    )

    await user.click(screen.getByRole('button', { name: 'Open' }))
    const content = await screen.findByTestId('modal-content')
    expect(content.className).toContain(modalStableTallBlockSizeClasses)
    expect(content.className).toContain('max-h-[90vh]')
    expect(content.className).not.toContain(modalStableBlockSizeClasses)
    expect(content.className).not.toContain('max-h-[85vh]')
  })

  it('ignores stableSize when layout is content', async () => {
    const user = userEvent.setup()
    render(
      <Modal.Root>
        <Modal.Trigger asChild>
          <Button>Open</Button>
        </Modal.Trigger>
        <Modal.Content layout="content" stableSize="tall" data-testid="modal-content">
          <Modal.Header headline="Content layout" />
          <Modal.Body>Short body</Modal.Body>
        </Modal.Content>
      </Modal.Root>,
    )

    await user.click(screen.getByRole('button', { name: 'Open' }))
    const content = await screen.findByTestId('modal-content')
    expect(content.className).not.toContain(modalStableBlockSizeClasses)
    expect(content.className).not.toContain(modalStableTallBlockSizeClasses)
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
