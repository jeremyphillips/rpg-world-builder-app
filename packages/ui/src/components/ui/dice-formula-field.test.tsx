import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { DiceFormulaField } from './dice-formula-field.client'
import {
  DEFAULT_DICE_FORMULA_VALUE,
  DEFAULT_DICE_FORMULA_WITH_MODIFIER,
} from './dice-formula-field.lib'

describe('DiceFormulaField', () => {
  it('renders the label and dice controls', () => {
    render(<DiceFormulaField id="roll" label="Roll" modifierMode="optional" />)

    const label = screen.getByText('Roll').closest('label')
    expect(label).toHaveAttribute('id', 'roll-label')
    expect(label).toHaveAttribute('for', 'roll-count')

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
    const { container } = render(
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

    const modifierGroups = container.querySelectorAll(
      '.grid.w-fit.min-w-max.max-w-full.rounded-md.border',
    )
    expect(modifierGroups.length).toBeGreaterThanOrEqual(2)
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

  it('uses grouped core shell with aligned md control heights', () => {
    const { container } = render(
      <DiceFormulaField id="roll" label="Roll" modifierMode="none" size="md" />,
    )

    const coreGroup = container.querySelector('.grid.w-fit.min-w-max.max-w-full.rounded-md.border')
    expect(coreGroup).toBeInTheDocument()
    expect(coreGroup).toHaveClass('grid-flow-col', 'auto-cols-max')

    expect(screen.getByLabelText('Count')).toHaveClass('h-9')
    expect(screen.getByLabelText('Die faces')).toHaveClass('h-9')
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

    expect(screen.getByLabelText('Count').parentElement).toHaveClass(sharedTwoDigitWidth)
    expect(screen.getByLabelText('Modifier').parentElement).toHaveClass(sharedTwoDigitWidth)

    const facesTrigger = screen.getByLabelText('Die faces')
    expect(facesTrigger).toHaveClass('w-auto')
    expect(facesTrigger.querySelector('[data-select-value-slot]')).toHaveClass(
      'min-w-[calc(3*1ch)]',
    )

    const operatorTrigger = screen.getByLabelText('Operator')
    expect(operatorTrigger.querySelector('[data-select-value-slot]')).toHaveClass(
      'min-w-[calc(1*1ch)]',
    )
  })

  it('shows a static multiply glyph when only one operator is allowed', () => {
    const { container } = render(
      <DiceFormulaField
        id="wealth-roll"
        label="Bonus roll"
        modifierMode="required"
        modifierOperators={['×']}
        modifierAmountLabel="Multiplier"
        value={{ count: 1, faces: 10, modifier: { operator: '×', amount: 250 } }}
      />,
    )

    expect(screen.queryByLabelText('Operator')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Multiplier')).toHaveValue(250)

    const multiplyGlyph = screen.getByText('×')
    expect(multiplyGlyph).toHaveClass('ps-2')
    expect(multiplyGlyph.closest('[aria-hidden]')).not.toHaveClass('bg-surface-faint')

    const dividers = container.querySelectorAll('.bg-border, .bg-border-subtle')
    expect(dividers.length).toBeGreaterThanOrEqual(2)
  })

  it('uses sizingLabels ghosts for the currency unit select', () => {
    render(
      <DiceFormulaField
        id="wealth"
        label="Wealth roll"
        modifierMode="required"
        currencyUnit={{
          value: 'gp',
          options: [
            { value: 'cp', label: 'CP' },
            { value: 'gp', label: 'GP' },
            { value: 'sp', label: 'SP' },
          ],
          onChange: vi.fn(),
        }}
        value={{ count: 1, faces: 6, modifier: { operator: '+', amount: 10 } }}
      />,
    )

    const trigger = screen.getByLabelText('Currency')
    expect(trigger.querySelectorAll('[data-select-sizing-label]')).toHaveLength(3)
    expect(trigger.querySelector('[data-select-value-slot]')).not.toHaveClass('min-w-[calc(2*1ch)]')
    expect(trigger).toHaveTextContent('GP')
  })

  it('renders the dice separator as a faint middle segment with subtle trailing divider', () => {
    const { container } = render(
      <DiceFormulaField id="roll" label="Roll" modifierMode="none" size="md" />,
    )

    const diceSeparator = screen.getByText('d')
    expect(diceSeparator).toHaveClass('ps-2', 'pe-2', 'font-mono')
    expect(diceSeparator.closest('[aria-hidden]')).toHaveClass('bg-surface-faint')
    expect(container.querySelector('.bg-border-subtle')).toBeInTheDocument()
  })

  itAxe('has no axe violations with multiply-only mode', async () => {
    const { container } = render(
      <DiceFormulaField
        id="wealth-roll"
        label="Bonus roll"
        modifierMode="required"
        modifierOperators={['×']}
        modifierAmountLabel="Multiplier"
        value={{ count: 1, faces: 10, modifier: { operator: '×', amount: 250 } }}
      />,
    )

    await expectNoAxeViolations(container)
  })

  itAxe('has no axe violations', async () => {
    const { container } = render(
      <DiceFormulaField
        id="roll"
        label="Roll"
        modifierMode="optional"
        value={{ count: 2, faces: 6, modifier: { operator: '+', amount: 3 } }}
        hint="Example hint"
      />,
    )

    await expectNoAxeViolations(container)
  })
})
