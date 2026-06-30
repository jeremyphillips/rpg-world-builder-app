import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'

import { CheckboxField } from './checkbox-field'

describe('CheckboxField', () => {
  it('toggles via its associated label', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(<CheckboxField id="homebrew" label="Allow homebrew" onCheckedChange={onCheckedChange} />)
    await user.click(screen.getByLabelText('Allow homebrew'))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('renders the error and marks the checkbox invalid', () => {
    render(<CheckboxField id="homebrew" label="Allow homebrew" error="Required." />)
    expect(screen.getByRole('alert')).toHaveTextContent('Required.')
    expect(screen.getByLabelText('Allow homebrew')).toHaveAttribute('aria-invalid', 'true')
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(<CheckboxField id="homebrew" label="Allow homebrew" />)
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })

  it('stacks inline label and hint in the same column beside the checkbox', () => {
    render(
      <CheckboxField
        id="homebrew"
        label="Allow homebrew"
        hint="Includes third-party content in search results."
      />,
    )
    const label = screen.getByText('Allow homebrew')
    const hint = screen.getByText('Includes third-party content in search results.')
    const textColumn = label.parentElement

    expect(textColumn).toHaveClass('flex', 'flex-col', 'gap-1')
    expect(textColumn).toContainElement(hint)
  })
})
