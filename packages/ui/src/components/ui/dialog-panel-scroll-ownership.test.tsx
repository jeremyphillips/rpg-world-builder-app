import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DialogPanelScrollRegion } from './dialog-panel-scroll-region.client'
import { Modal } from './modal.client'
import { Sheet } from './sheet.client'
import { FormShellFieldStack } from '../../form/shells/form-shell-field-stack.client'

function countOverflowAutoInDocument(): number {
  return document.querySelectorAll('.overflow-y-auto').length
}

describe('overlay scroll ownership', () => {
  it('default Modal.Body owns exactly one scrollport', () => {
    render(
      <Modal.Root open>
        <Modal.Content>
          <Modal.Header headline="Title" />
          <Modal.Body>Body</Modal.Body>
        </Modal.Content>
      </Modal.Root>,
    )

    expect(countOverflowAutoInDocument()).toBe(1)
  })

  it('stableBody + inner DialogPanelScrollRegion owns exactly one scrollport', () => {
    render(
      <Modal.Root open>
        <Modal.Content>
          <Modal.Header headline="Title" />
          <Modal.Body stableBody>
            <DialogPanelScrollRegion inset="inner">Inner</DialogPanelScrollRegion>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>,
    )

    expect(countOverflowAutoInDocument()).toBe(1)
  })

  it('default Sheet.Body owns exactly one scrollport', () => {
    render(
      <Sheet.Root open>
        <Sheet.Content>
          <Sheet.Header headline="Title" />
          <Sheet.Body>Body</Sheet.Body>
        </Sheet.Content>
      </Sheet.Root>,
    )

    expect(countOverflowAutoInDocument()).toBe(1)
  })

  it('managed Sheet.Body does not auto-wrap a scrollport', () => {
    render(
      <Sheet.Root open>
        <Sheet.Content>
          <Sheet.Header headline="Title" />
          <Sheet.Body managed>
            <DialogPanelScrollRegion inset="inner">Inner</DialogPanelScrollRegion>
          </Sheet.Body>
        </Sheet.Content>
      </Sheet.Root>,
    )

    expect(countOverflowAutoInDocument()).toBe(1)
  })

  it('Form externalFooter path owns exactly one scrollport', () => {
    render(
      <FormShellFieldStack formId="test-form" fields={[]} externalFooter stickyFooter={false} />,
    )

    expect(countOverflowAutoInDocument()).toBe(1)
  })

  it('CreateModalShell-style scroll region owns exactly one scrollport', () => {
    render(
      <Modal.Root open>
        <Modal.Content layout="stable">
          <Modal.Header headline="Create" />
          <Modal.Body stableBody>
            <DialogPanelScrollRegion inset="inner" data-testid="create-scroll">
              Panel
            </DialogPanelScrollRegion>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>,
    )

    expect(countOverflowAutoInDocument()).toBe(1)
    expect(screen.getByTestId('create-scroll')).toHaveClass('overflow-y-auto')
  })
})
