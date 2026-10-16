import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import {
  UI_CHOICE_CONTROL_BLOCK_CLASS,
  UI_CHOICE_CONTROL_CIRCLE_CLASS,
} from './choice-control.styles'
import { Checkbox } from './checkbox.client'

describe('Checkbox', () => {
  it('emits semantic choice-control classes', () => {
    render(<Checkbox aria-label="Accept terms" />)
    expect(screen.getByLabelText('Accept terms')).toHaveClass(
      UI_CHOICE_CONTROL_BLOCK_CLASS,
      'ui-choice-control--checkbox',
    )
  })

  it('toggles checked state on click', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(<Checkbox aria-label="Accept terms" onCheckedChange={onCheckedChange} />)
    await user.click(screen.getByLabelText('Accept terms'))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('reflects the error state via aria-invalid', () => {
    render(<Checkbox aria-label="Accept terms" aria-invalid />)
    expect(screen.getByLabelText('Accept terms')).toHaveAttribute('aria-invalid', 'true')
  })

  it('applies circle appearance classes', () => {
    render(<Checkbox appearance="circle" aria-label="Equipped item" defaultChecked />)
    const control = screen.getByLabelText('Equipped item')
    expect(control).toHaveClass(UI_CHOICE_CONTROL_CIRCLE_CLASS)
    expect(control).toHaveAttribute('data-state', 'checked')
  })

  it('supports checked disabled circle state', () => {
    render(<Checkbox appearance="circle" aria-label="Equipped item" defaultChecked disabled />)
    const control = screen.getByLabelText('Equipped item')
    expect(control).toBeDisabled()
    expect(control).toHaveAttribute('data-state', 'checked')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(<Checkbox aria-label="Accept terms" />)
    await expectNoAxeViolations(container)
  })
})
