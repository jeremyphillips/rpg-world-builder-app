import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it, vi } from 'vitest'

import { DiceFormulaField } from './dice-formula-field.client'
import {
  DEFAULT_DICE_FORMULA_VALUE,
  DEFAULT_DICE_FORMULA_WITH_MODIFIER,
} from './dice-formula-field.lib'

describe('DiceFormulaField', () => {
  it('renders the legend and dice controls', () => {
    render(<DiceFormulaField id="roll" label="Roll" modifierMode="optional" />)

    expect(screen.getByText('Roll')).toBeInTheDocument()
    expect(screen.getByLabelText('Count')).toBeInTheDocument()
    expect(screen.getByLabelText('Die faces')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add modifier' })).toBeInTheDocument()
  })

  it('starts optional mode collapsed at 1d6', () => {
    render(
      <DiceFormulaField
        id="roll"
        label="Roll"
        modifierMode="optional"
        value={DEFAULT_DICE_FORMULA_VALUE}
      />,
    )

    expect(screen.getByLabelText('Count')).toHaveValue(1)
    expect(screen.queryByLabelText('Operator')).not.toBeInTheDocument()
  })

  it('adds and removes an optional modifier', async () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <DiceFormulaField
        id="roll"
        label="Roll"
        modifierMode="optional"
        value={DEFAULT_DICE_FORMULA_VALUE}
        onChange={onChange}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Add modifier' }))
    expect(onChange).toHaveBeenLastCalledWith({
      count: 1,
      faces: 6,
      modifier: { operator: '+', amount: 1 },
    })

    rerender(
      <DiceFormulaField
        id="roll"
        label="Roll"
        modifierMode="optional"
        value={{ count: 1, faces: 6, modifier: { operator: '+', amount: 1 } }}
        onChange={onChange}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Remove modifier' }))
    expect(onChange).toHaveBeenLastCalledWith({ count: 1, faces: 6 })
  })

  it('shows required modifier controls with 1d6+1 defaults', () => {
    render(
      <DiceFormulaField
        id="roll"
        label="Damage"
        modifierMode="required"
        value={DEFAULT_DICE_FORMULA_WITH_MODIFIER}
      />,
    )

    expect(screen.getByLabelText('Operator')).toBeInTheDocument()
    expect(screen.getByLabelText('Modifier')).toHaveValue(1)
    expect(screen.queryByRole('button', { name: 'Add modifier' })).not.toBeInTheDocument()
  })

  it('omits modifier UI in none mode', () => {
    render(<DiceFormulaField id="hit-die" label="Hit die" modifierMode="none" />)

    expect(screen.queryByRole('button', { name: 'Add modifier' })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Operator')).not.toBeInTheDocument()
  })

  it('renders inline label layout', () => {
    const { container } = render(<DiceFormulaField id="roll" label="Roll" labelPosition="inline" />)

    expect(document.getElementById('roll-inline-label')).toHaveTextContent('Roll')
    expect(container.querySelector('.gap-3')).toHaveClass('flex', 'flex-wrap', 'items-center')
  })

  it('aligns count and digit-sized select widths for the same digit count', () => {
    render(
      <DiceFormulaField
        id="roll"
        label="Roll"
        modifierMode="required"
        size="md"
        countMax={99}
        modifierMax={99}
        faces={[6, 8, 100]}
        value={{ count: 10, faces: 100, modifier: { operator: '+', amount: 10 } }}
      />,
    )

    const sharedTwoDigitWidth = 'w-[calc(2*1ch+2.75rem)]'
    const facesThreeDigitWidth = 'w-[calc(3*1ch+2.75rem)]'

    expect(screen.getByLabelText('Count').parentElement).toHaveClass(sharedTwoDigitWidth)
    expect(screen.getByLabelText('Modifier').parentElement).toHaveClass(sharedTwoDigitWidth)
    expect(screen.getByLabelText('Die faces')).toHaveClass(facesThreeDigitWidth)
    expect(screen.getByLabelText('Operator')).toHaveClass('w-[calc(1*1ch+2.75rem)]')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <DiceFormulaField
        id="roll"
        label="Roll"
        modifierMode="optional"
        value={{ count: 2, faces: 6, modifier: { operator: '+', amount: 3 } }}
        hint="Example hint"
      />,
    )

    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
