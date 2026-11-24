import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { InlineTitleEditActionButton } from './inline-title-edit-action-button.client'

describe('InlineTitleEditActionButton', () => {
  it('uses icon-xs ghost edit chrome', () => {
    render(<InlineTitleEditActionButton editing={false} onClick={vi.fn()} />)
    const button = screen.getByRole('button', { name: 'Edit name' })
    expect(button).toHaveClass('ui-button--icon-xs', 'ui-button--ghost')
  })

  it('hides the control from interaction while editing', () => {
    const { container } = render(<InlineTitleEditActionButton editing onClick={vi.fn()} />)
    const button = container.querySelector('button')
    expect(button).toHaveClass('invisible', 'ui-button--icon-xs')
    expect(button).toHaveAttribute('aria-hidden', 'true')
    expect(button).toHaveAttribute('tabindex', '-1')
  })
})
