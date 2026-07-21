import { describe, expect, it } from 'vitest'
import * as React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { NumberStepper } from './number-stepper.client'

function Harness({ initial = 3, max = 10 }: { initial?: number; max?: number }) {
  const [value, setValue] = React.useState(initial)
  return <NumberStepper aria-label="Quantity" value={value} min={1} max={max} onChange={setValue} />
}

describe('NumberStepper', () => {
  it('renders minus, input, and plus controls', () => {
    render(<Harness />)
    expect(screen.getByLabelText('Quantity')).toBeInTheDocument()
    expect(screen.getByLabelText('Decrease Quantity')).toBeInTheDocument()
    expect(screen.getByLabelText('Increase Quantity')).toBeInTheDocument()
  })

  it('increments and decrements via side buttons', async () => {
    render(<Harness initial={5} />)

    await userEvent.click(screen.getByLabelText('Increase Quantity'))
    expect(screen.getByLabelText('Quantity')).toHaveValue(6)

    await userEvent.click(screen.getByLabelText('Decrease Quantity'))
    expect(screen.getByLabelText('Quantity')).toHaveValue(5)
  })

  it('disables increment at max', () => {
    render(<Harness initial={10} max={10} />)
    expect(screen.getByLabelText('Increase Quantity')).toBeDisabled()
    expect(screen.getByLabelText('Decrease Quantity')).not.toBeDisabled()
  })

  it('renders the current value with foreground text in the digit slot', () => {
    render(<Harness initial={12} />)
    const input = screen.getByLabelText('Quantity')
    expect(input).toHaveValue(12)
    expect(input).toHaveClass('text-foreground')
    expect(input).toHaveClass('w-[2ch]')
  })

  it('applies bordered pill styles by default', () => {
    const { container } = render(<Harness />)
    const root = container.firstElementChild
    expect(root).toHaveClass('rounded-full')
    expect(root).toHaveClass('border')
    expect(root).toHaveClass('border-input')
  })

  it('uses transparent stepper buttons with primary hover text', () => {
    render(<Harness />)

    const decreaseButton = screen.getByLabelText('Decrease Quantity')
    expect(decreaseButton).toHaveClass('bg-transparent')
    expect(decreaseButton).toHaveClass('hover:bg-transparent')
    expect(decreaseButton).toHaveClass('hover:text-primary')
    expect(decreaseButton).toHaveClass('active:text-primary')
  })

  it('omits border classes when borderless', () => {
    const { container } = render(
      <NumberStepper aria-label="Quantity" value={3} bordered={false} onChange={() => undefined} />,
    )
    const root = container.firstElementChild
    expect(root).not.toHaveClass('border')
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(<Harness />)
    await expectNoAxeViolations(container)
  })
})
