import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'

import { SwitchField } from './switch-field'

describe('SwitchField', () => {
  it('toggles via its associated label', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(<SwitchField id="notify" label="Email reminders" onCheckedChange={onCheckedChange} />)
    await user.click(screen.getByLabelText('Email reminders'))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('exposes the switch role with its label', () => {
    render(<SwitchField id="notify" label="Email reminders" />)
    expect(screen.getByRole('switch', { name: 'Email reminders' })).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(<SwitchField id="notify" label="Email reminders" />)
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })

  it('renders the label above the switch when labelPosition is above', () => {
    render(<SwitchField id="notify" label="Email reminders" labelPosition="above" />)
    const switchControl = screen.getByRole('switch', { name: 'Email reminders' })
    const label = screen.getByText('Email reminders')
    expect(
      label.compareDocumentPosition(switchControl) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('stacks inline label and hint in the same column beside the switch', () => {
    render(
      <SwitchField
        id="multiclass"
        label="Allow multiclassing"
        hint="When off, characters cannot take levels in additional classes."
      />,
    )
    const label = screen.getByText('Allow multiclassing')
    const hint = screen.getByText('When off, characters cannot take levels in additional classes.')
    const textColumn = label.parentElement

    expect(textColumn).toHaveClass('flex', 'flex-col', 'gap-1')
    expect(textColumn).toContainElement(hint)
    expect(
      textColumn?.compareDocumentPosition(label) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(label.parentElement?.parentElement).toHaveClass('flex', 'items-start', 'gap-2')
  })
})
