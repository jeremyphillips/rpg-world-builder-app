import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DialogPanelBody } from './dialog-panel-body.client'

function countOverflowAutoRoots(container: HTMLElement): number {
  return container.querySelectorAll('.overflow-y-auto').length
}

describe('DialogPanelBody', () => {
  it('auto-wires a single scroll owner for default scroll mode', () => {
    const { container } = render(
      <DialogPanelBody data-testid="body-viewport" className="space-y-4">
        Content
      </DialogPanelBody>,
    )

    expect(countOverflowAutoRoots(container)).toBe(1)
    const viewport = screen.getByTestId('body-viewport')
    expect(viewport).toHaveClass('overflow-y-auto')
    expect(viewport).toHaveClass('space-y-4')
    expect(viewport).toHaveClass('pt-5')
  })

  it('keeps stable mode clip-only with attributes on the shell', () => {
    const { container } = render(
      <DialogPanelBody mode="stable" data-testid="stable-body">
        <div data-testid="inner-scroll" className="overflow-y-auto">
          Content
        </div>
      </DialogPanelBody>,
    )

    expect(countOverflowAutoRoots(container)).toBe(1)
    const shell = screen.getByTestId('stable-body')
    expect(shell).toHaveClass('overflow-hidden')
    expect(shell).not.toHaveClass('overflow-y-auto')
    expect(shell).toHaveClass('px-6')
  })

  it('keeps stableClip mode clip-only without shell horizontal inset', () => {
    const { container } = render(
      <DialogPanelBody mode="stableClip" data-testid="stable-clip-body">
        <div data-testid="section-scroll" className="overflow-y-auto px-6">
          Content
        </div>
      </DialogPanelBody>,
    )

    expect(countOverflowAutoRoots(container)).toBe(1)
    const shell = screen.getByTestId('stable-clip-body')
    expect(shell).toHaveClass('overflow-hidden')
    expect(shell).not.toHaveClass('overflow-y-auto')
    expect(shell).not.toHaveClass('px-6')
  })

  it('keeps managed mode clip-only with attributes on the shell', () => {
    const { container } = render(
      <DialogPanelBody mode="managed" data-testid="managed-body">
        <div className="overflow-y-auto">Content</div>
      </DialogPanelBody>,
    )

    expect(countOverflowAutoRoots(container)).toBe(1)
    const shell = screen.getByTestId('managed-body')
    expect(shell).toHaveClass('overflow-hidden')
    expect(shell).toHaveClass('p-0')
    expect(shell).not.toHaveClass('overflow-y-auto')
  })

  it('forwards aria and event props to the scroll viewport in scroll mode', () => {
    render(
      <DialogPanelBody
        data-testid="body-viewport"
        aria-label="Panel body"
        onScroll={() => undefined}
      >
        Content
      </DialogPanelBody>,
    )

    const viewport = screen.getByTestId('body-viewport')
    expect(viewport).toHaveAttribute('aria-label', 'Panel body')
  })
})
