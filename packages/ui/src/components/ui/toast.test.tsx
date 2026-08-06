import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { ToastPresentation } from './toast.client'
import { getToastState, resolveToastDuration, toast } from './toast-manager.client'
import { ToastProvider } from './toast-provider.client'
import { ToastViewport } from './toast-viewport.client'

describe('ToastPresentation', () => {
  it('renders title and description', () => {
    render(
      <ToastPresentation
        tone="success"
        title="Character saved"
        description="Your changes were applied."
      />,
    )

    expect(screen.getByText('Character saved')).toBeInTheDocument()
    expect(screen.getByText('Your changes were applied.')).toBeInTheDocument()
  })

  it('uses status role by default and alert role when urgent', () => {
    const { rerender } = render(<ToastPresentation tone="destructive" title="Could not save" />)
    expect(screen.getByRole('status')).toBeInTheDocument()

    rerender(<ToastPresentation tone="destructive" title="Could not save" urgent />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('fires onDismiss from the dismiss control', async () => {
    const onDismiss = vi.fn()
    render(<ToastPresentation title="Character saved" onDismiss={onDismiss} />)

    await userEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }))
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <ToastPresentation
        tone="success"
        title="Character saved"
        description="Your changes were applied."
        action={<button type="button">Retry</button>}
        onDismiss={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})

describe('ToastViewport', () => {
  it('applies fixed positioning and the shared toast layer to the Radix ol viewport', () => {
    render(
      <ToastProvider viewport={<ToastViewport data-testid="viewport" />}>
        <span>App</span>
      </ToastProvider>,
    )
    expect(screen.getByTestId('viewport')).toHaveClass('fixed', 'z-toast')
  })
})

describe('toast manager', () => {
  it('resolves duration by tone and persistent mode', () => {
    expect(resolveToastDuration({ tone: 'success' })).toBe(4000)
    expect(resolveToastDuration({ tone: 'destructive' })).toBe(8000)
    expect(resolveToastDuration({ tone: 'default', duration: 1200 })).toBe(1200)
    expect(resolveToastDuration({ tone: 'warning', duration: 'persistent' })).toBe(
      Number.POSITIVE_INFINITY,
    )
  })

  it('replaces toasts with the same id', () => {
    toast.dismissAll()
    toast({ id: 'save-error', title: 'First failure', tone: 'destructive' })
    toast({ id: 'save-error', title: 'Updated failure', tone: 'destructive' })

    expect(getToastState().toasts).toHaveLength(1)
    expect(getToastState().toasts[0]?.title).toBe('Updated failure')
  })

  it('limits visible open toasts to three and invokes evicted onDismiss once', () => {
    toast.dismissAll()
    const onDismiss = vi.fn()
    toast({ title: 'One', tone: 'default', onDismiss })
    toast({ title: 'Two', tone: 'default' })
    toast({ title: 'Three', tone: 'default' })
    toast({ title: 'Four', tone: 'default' })

    expect(getToastState().toasts.filter((record) => record.open)).toHaveLength(3)
    expect(getToastState().toasts[0]?.title).toBe('Four')
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('invokes onDismiss once when toast is dismissed', () => {
    toast.dismissAll()
    const onDismiss = vi.fn()
    const id = toast({ title: 'Dismiss me', onDismiss })

    toast.dismiss(id)

    expect(onDismiss).toHaveBeenCalledOnce()
  })
})

describe('ToastProvider', () => {
  it('renders managed toasts from the imperative API', async () => {
    toast.dismissAll()

    render(
      <ToastProvider>
        <button type="button" onClick={() => toast.success('Character saved')}>
          Trigger toast
        </button>
      </ToastProvider>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Trigger toast' }))
    expect(await screen.findByText('Character saved')).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations on the managed toast path', async () => {
    toast.dismissAll()

    const { container } = render(
      <ToastProvider>
        <button
          type="button"
          onClick={() =>
            toast({
              title: 'Could not save',
              description: 'Try again.',
              tone: 'destructive',
              action: { label: 'Retry', onClick: vi.fn() },
            })
          }
        >
          Trigger toast
        </button>
      </ToastProvider>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Trigger toast' }))
    expect(await screen.findByText('Could not save')).toBeInTheDocument()
    await expectNoAxeViolations(container)
  })
})
