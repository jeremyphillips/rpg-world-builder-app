import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DialogPanelScrollRegion } from './dialog-panel-scroll-region.client'
import { Modal } from './modal.client'
import { Sheet } from './sheet.client'
import {
  dialogPanelSectionInsetXClasses,
  dialogPanelScrollRegionFocusClearanceClasses,
} from './dialog-panel.variants'
import { boundedScrollRegionEndInsetClasses } from './bounded-scroll-region.variants'
import { FormShellFieldStack } from '../../form/shells/form-shell-field-stack.client'

function hasClass(node: Element | null, classToken: string): boolean {
  return node?.classList.contains(classToken) ?? false
}

describe('dialog panel scroll inset composition', () => {
  it('default Modal.Body viewport owns section inset without padded clip shell', () => {
    render(
      <Modal.Root open>
        <Modal.Content>
          <Modal.Header headline="Title" />
          <Modal.Body data-testid="body-viewport">Body</Modal.Body>
        </Modal.Content>
      </Modal.Root>,
    )

    const viewport = screen.getByTestId('body-viewport')
    expect(viewport).toHaveClass(dialogPanelSectionInsetXClasses)

    const clipShell = viewport.parentElement
    expect(clipShell).not.toBeNull()
    expect(hasClass(clipShell, dialogPanelSectionInsetXClasses)).toBe(false)
  })

  it('stableBody shell owns section inset while inner viewport owns scroll chrome', () => {
    render(
      <Modal.Root open>
        <Modal.Content>
          <Modal.Header headline="Title" />
          <Modal.Body stableBody data-testid="stable-shell">
            <DialogPanelScrollRegion inset="inner" data-testid="inner-viewport">
              Inner
            </DialogPanelScrollRegion>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>,
    )

    const shell = screen.getByTestId('stable-shell')
    const viewport = screen.getByTestId('inner-viewport')

    expect(shell).toHaveClass(dialogPanelSectionInsetXClasses)
    expect(viewport).toHaveClass(dialogPanelScrollRegionFocusClearanceClasses)
    expect(viewport).toHaveClass(boundedScrollRegionEndInsetClasses)
    expect(viewport).not.toHaveClass(dialogPanelSectionInsetXClasses)
  })

  it('externalFooter uses managed shell plus section viewport inset', () => {
    render(
      <Sheet.Root open>
        <Sheet.Content>
          <Sheet.Header headline="Title" />
          <Sheet.Body managed data-testid="managed-shell">
            <FormShellFieldStack
              formId="test-form"
              fields={[]}
              externalFooter
              stickyFooter={false}
            />
          </Sheet.Body>
        </Sheet.Content>
      </Sheet.Root>,
    )

    const managedShell = screen.getByTestId('managed-shell')
    expect(managedShell).not.toHaveClass(dialogPanelSectionInsetXClasses)

    const viewport = managedShell.querySelector('.overflow-y-auto')
    expect(viewport).not.toBeNull()
    expect(viewport).toHaveClass(dialogPanelSectionInsetXClasses)
    expect(viewport).toHaveClass('pt-5')
    expect(viewport).not.toHaveClass(dialogPanelScrollRegionFocusClearanceClasses)
  })

  it('CreateModalShell-style pinned chrome shares shell section inset with inner scroll', () => {
    render(
      <Modal.Root open>
        <Modal.Content layout="stable" aria-describedby={undefined}>
          <Modal.Header headline="Create" />
          <Modal.Body stableBody data-testid="stable-shell">
            <p data-testid="pinned-chrome">Pinned</p>
            <DialogPanelScrollRegion inset="inner" data-testid="inner-viewport">
              <p data-testid="scroll-content">Panel</p>
            </DialogPanelScrollRegion>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>,
    )

    const shell = screen.getByTestId('stable-shell')
    const viewport = screen.getByTestId('inner-viewport')

    expect(shell).toHaveClass(dialogPanelSectionInsetXClasses)
    expect(viewport).toHaveClass(dialogPanelScrollRegionFocusClearanceClasses)
    expect(viewport).toHaveClass(boundedScrollRegionEndInsetClasses)
    expect(viewport).not.toHaveClass(dialogPanelSectionInsetXClasses)
    expect(screen.getByTestId('pinned-chrome').parentElement).toBe(shell)
  })

  it('stableBodyClip avoids double section inset when child uses section scrollport', () => {
    render(
      <Modal.Root open>
        <Modal.Content layout="stable" aria-describedby={undefined}>
          <Modal.Header headline="Create" />
          <Modal.Body stableBody stableBodyClip data-testid="stable-clip-shell">
            <div className={dialogPanelSectionInsetXClasses} data-testid="pinned-chrome">
              Pinned
            </div>
            <DialogPanelScrollRegion inset="section" data-testid="section-viewport">
              Panel
            </DialogPanelScrollRegion>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>,
    )

    const shell = screen.getByTestId('stable-clip-shell')
    const viewport = screen.getByTestId('section-viewport')

    expect(shell).not.toHaveClass(dialogPanelSectionInsetXClasses)
    expect(viewport).toHaveClass(dialogPanelSectionInsetXClasses)
    expect(viewport).not.toHaveClass(dialogPanelScrollRegionFocusClearanceClasses)
  })
})
