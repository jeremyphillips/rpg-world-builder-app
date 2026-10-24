import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as DialogPrimitive from '@radix-ui/react-dialog'

import { DialogCloseButton } from './dialog-parts.client'

function CloseInDialog() {
  return (
    <DialogPrimitive.Root open>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Content aria-describedby={undefined}>
          <DialogCloseButton closeLabel="Close panel" />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

describe('DialogCloseButton', () => {
  it('matches header back icon control geometry and glyph scale', async () => {
    const user = userEvent.setup()
    render(<CloseInDialog />)

    const button = screen.getByRole('button', { name: 'Close panel' })
    expect(button).toHaveClass('ui-compact-control--icon-default')

    const glyph = button.querySelector('svg')
    expect(glyph).toHaveClass('ui-icon', 'ui-icon--owner')

    await user.click(button)
  })
})
