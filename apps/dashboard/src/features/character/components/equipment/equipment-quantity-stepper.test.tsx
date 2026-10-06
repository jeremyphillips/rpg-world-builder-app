/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import {
  EquipmentQuantityStepper,
  type EquipmentQuantityStepperProps,
} from './equipment-quantity-stepper'

function renderStepper(overrides: Partial<EquipmentQuantityStepperProps> = {}) {
  const onChange = vi.fn()

  const result = render(
    <EquipmentQuantityStepper
      value={2}
      min={1}
      max={5}
      size="sm"
      digits={2}
      ariaLabel="Dagger quantity"
      onChange={onChange}
      {...overrides}
    />,
  )

  return { onChange, ...result }
}

describe('EquipmentQuantityStepper', () => {
  it('reports the next quantity when incremented', async () => {
    const user = userEvent.setup()
    const { onChange } = renderStepper()

    await user.click(screen.getByRole('button', { name: /increase/i }))

    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('omits the plus adornment unless the quantity stacks on other sources', () => {
    const { rerender } = renderStepper()
    expect(screen.queryByText('+')).not.toBeInTheDocument()

    rerender(
      <EquipmentQuantityStepper
        value={2}
        min={1}
        max={5}
        size="sm"
        digits={2}
        additional
        ariaLabel="Dagger quantity"
        onChange={vi.fn()}
      />,
    )
    expect(screen.getByText('+')).toBeInTheDocument()
  })

  it('swaps the decrement for a remove affordance at the minimum', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    renderStepper({ value: 1, remove: { ariaLabel: 'Remove Dagger', onRemove } })

    await user.click(screen.getByRole('button', { name: 'Remove Dagger' }))

    expect(onRemove).toHaveBeenCalledOnce()
  })

  it('ignores the remove affordance when zero is a valid quantity', () => {
    renderStepper({ value: 1, min: 0, remove: { ariaLabel: 'Remove Dagger', onRemove: vi.fn() } })

    expect(screen.queryByRole('button', { name: 'Remove Dagger' })).not.toBeInTheDocument()
  })

  itAxe('has no accessibility violations in the card header tier', async () => {
    const { container } = renderStepper({ size: 'xs', digits: 1, additional: true })

    await expectNoAxeViolations(container)
  })
})
