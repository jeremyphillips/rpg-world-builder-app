import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'

import { InfoTooltip } from './tooltip.client'

describe('InfoTooltip', () => {
  it('renders a focusable button with the required accessible name', () => {
    render(<InfoTooltip aria-label="About alignment">A moral compass.</InfoTooltip>)
    expect(screen.getByRole('button', { name: 'About alignment' })).toBeInTheDocument()
  })

  it('reveals the tooltip content on keyboard focus', async () => {
    const user = userEvent.setup()
    render(<InfoTooltip aria-label="About alignment">A moral compass.</InfoTooltip>)
    await user.tab()
    expect(await screen.findByRole('tooltip')).toHaveTextContent('A moral compass.')
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <InfoTooltip aria-label="About alignment">A moral compass.</InfoTooltip>,
    )
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
