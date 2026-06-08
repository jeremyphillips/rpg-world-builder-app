import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'

import { Switch } from './switch.client'

describe('Switch', () => {
  it('toggles on click', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(<Switch aria-label="Enable notifications" onCheckedChange={onCheckedChange} />)
    await user.click(screen.getByLabelText('Enable notifications'))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('exposes the switch role', () => {
    render(<Switch aria-label="Enable notifications" />)
    expect(screen.getByRole('switch', { name: 'Enable notifications' })).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(<Switch aria-label="Enable notifications" />)
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
