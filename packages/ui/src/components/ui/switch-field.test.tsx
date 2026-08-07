import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { SwitchField } from './switch-field'

describe('SwitchField', () => {
  it('applies field size to the label', () => {
    render(<SwitchField id="notify" label="Email reminders" size="sm" />)
    expect(screen.getByText('Email reminders')).toHaveClass('text-xs')
  })

  it('keeps inline label typography on fieldLabelVariants', () => {
    render(<SwitchField id="notify" label="Email reminders" />)
    const label = screen.getByText('Email reminders').closest('label')
    expect(label).not.toBeNull()
    expect(label).toHaveClass('font-field-label')
    expect(label).toHaveClass('min-h-5')
    expect(label).toHaveClass('w-fit', 'self-start')
    expect(label).not.toHaveClass('font-normal')
  })

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

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(<SwitchField id="notify" label="Email reminders" />)
    await expectNoAxeViolations(container)
  })

  it('renders the label above the switch when labelPosition is above', () => {
    render(<SwitchField id="notify" label="Email reminders" labelPosition="above" />)
    const switchControl = screen.getByRole('switch', { name: 'Email reminders' })
    const label = screen.getByText('Email reminders')
    expect(
      label.compareDocumentPosition(switchControl) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('does not toggle when clicking the hint beside a shorter label', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    const hint = 'When off, characters cannot take levels in additional classes.'
    render(
      <SwitchField
        id="multiclass"
        label="Allow multiclassing"
        hint={hint}
        onCheckedChange={onCheckedChange}
      />,
    )
    await user.click(screen.getByText(hint))
    expect(onCheckedChange).not.toHaveBeenCalled()
  })

  it('stacks inline label and hint in the same column beside the switch', () => {
    const { container } = render(
      <SwitchField
        id="multiclass"
        label="Allow multiclassing"
        hint="When off, characters cannot take levels in additional classes."
      />,
    )
    const label = screen.getByText('Allow multiclassing')
    const hint = screen.getByText('When off, characters cannot take levels in additional classes.')
    const textColumn = label.parentElement

    expect(textColumn).not.toBeNull()
    expect(textColumn).toHaveClass('flex', 'flex-col', 'gap-1')
    expect(textColumn).toContainElement(hint)
    expect(
      textColumn!.compareDocumentPosition(label) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    const row = label.parentElement?.parentElement
    expect(row).toHaveClass('flex', 'gap-2')
    expect(row?.firstElementChild).toHaveClass('flex', 'h-5', 'shrink-0', 'items-center')
    expect(container.querySelector('[data-field-align]')).not.toBeNull()
  })

  it('renders label and hint in the left column when labelPosition is settings', () => {
    const hint = 'Cap total character level for this species.'
    render(
      <SwitchField
        id="level-cap"
        label="Limit max character level"
        hint={hint}
        labelPosition="settings"
      />,
    )

    const switchControl = screen.getByRole('switch', { name: 'Limit max character level' })
    const row = switchControl.closest('.grid')
    expect(row).toHaveClass('sm:grid-cols-[minmax(0,1fr)_auto]')
    const label = screen.getByText('Limit max character level')
    expect(
      label.compareDocumentPosition(screen.getByText(hint)) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(
      screen.getByText(hint).compareDocumentPosition(switchControl) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  itAxe('has no axe accessibility violations with settings layout', async () => {
    const { container } = render(
      <SwitchField
        id="level-cap"
        label="Limit max character level"
        hint="Cap total character level for this species."
        labelPosition="settings"
      />,
    )
    await expectNoAxeViolations(container)
  })
})
