import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import {
  UI_CHOICE_CONTROL_BLOCK_CLASS,
  UI_CHOICE_CONTROL_CIRCLE_CLASS,
  UI_CHOICE_CONTROL_CIRCLE_EXPAND_CLASS,
  UI_CHOICE_CONTROL_EXPAND_ANCHOR_CLASS,
  UI_CHOICE_CONTROL_EXPAND_LABEL_CLASS,
  UI_CHOICE_CONTROL_EXPAND_RESERVE_CLASS,
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

  it('forwards ref to the checkbox root when the label expands', () => {
    const ref = { current: null as HTMLButtonElement | null }
    render(
      <Checkbox ref={ref} appearance="circle" expandLabel="Unequip" aria-label="Equipped: Axe" />,
    )
    const control = screen.getByRole('checkbox', { name: 'Equipped: Axe' })
    expect(ref.current).toBe(control)
    expect(control).toHaveClass(UI_CHOICE_CONTROL_CIRCLE_EXPAND_CLASS)
    expect(control.parentElement).toHaveClass(UI_CHOICE_CONTROL_EXPAND_ANCHOR_CLASS)
    expect(control.querySelector(`.${UI_CHOICE_CONTROL_EXPAND_LABEL_CLASS}`)).toHaveTextContent(
      'Unequip',
    )
  })

  it('reserves width with the other action word without announcing it', () => {
    render(
      <Checkbox
        appearance="circle"
        expandLabel="Equip"
        expandLabelReserve="Unequip"
        aria-label="Equipped: Axe"
      />,
    )
    const control = screen.getByRole('checkbox', { name: 'Equipped: Axe' })
    const reserve = control.querySelector(`.${UI_CHOICE_CONTROL_EXPAND_RESERVE_CLASS}`)
    expect(reserve).toHaveTextContent('Unequip')
    expect(reserve).toHaveAttribute('aria-hidden', 'true')
  })

  it('ignores expandLabel unless appearance is circle', () => {
    render(<Checkbox expandLabel="Equip" aria-label="Accept terms" />)
    const control = screen.getByRole('checkbox', { name: 'Accept terms' })
    expect(control).not.toHaveClass(UI_CHOICE_CONTROL_CIRCLE_EXPAND_CLASS)
    expect(control.querySelector(`.${UI_CHOICE_CONTROL_EXPAND_LABEL_CLASS}`)).toBeNull()
    expect(document.querySelector(`.${UI_CHOICE_CONTROL_EXPAND_ANCHOR_CLASS}`)).toBeNull()
  })

  it('uses standalone focus by default and embedded when requested', () => {
    const { rerender } = render(<Checkbox aria-label="Terms" />)
    expect(screen.getByLabelText('Terms')).toHaveClass('ui-focus-ring')
    expect(screen.getByLabelText('Terms')).not.toHaveClass('ui-focus-ring--embedded')

    rerender(<Checkbox aria-label="Terms" focusContext="embedded" />)
    expect(screen.getByLabelText('Terms')).toHaveClass('ui-focus-ring--embedded')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(<Checkbox aria-label="Accept terms" />)
    await expectNoAxeViolations(container)
  })
})
