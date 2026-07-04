import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { Checkbox } from './checkbox.client'

describe('Checkbox', () => {
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

  it('has no axe accessibility violations', async () => {
    const { container } = render(<Checkbox aria-label="Accept terms" />)
    await expectNoAxeViolations(container)
  })
})
