import { describe, expect, it, vi } from 'vitest'
import * as React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { FormSectionProvider } from '../../form/context/form-section.context'
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
    expect(input).toHaveClass('w-[36px]')
    expect(input).toHaveClass('border-x')
    expect(input).toHaveClass('border-border-faint')
  })

  it('applies bordered pill styles by default', () => {
    const { container } = render(<Harness />)
    const root = container.firstElementChild
    expect(root).toHaveClass('rounded-full')
    expect(root).toHaveClass('border')
    expect(root).toHaveClass('border-input')
  })

  it('defaults to md height outside form context', () => {
    const { container } = render(<Harness />)
    expect(container.firstElementChild).toHaveClass('h-9')
  })

  it('inherits sm height from compact form context when size is omitted', () => {
    const { container } = render(
      <FormSectionProvider density="compact">
        <Harness />
      </FormSectionProvider>,
    )
    expect(container.firstElementChild).toHaveClass('h-8')
  })

  it('keeps xs when explicitly requested', () => {
    const { container } = render(
      <FormSectionProvider density="compact">
        <NumberStepper
          aria-label="Quantity"
          size="xs"
          value={2}
          min={0}
          max={8}
          onChange={() => undefined}
        />
      </FormSectionProvider>,
    )
    expect(container.firstElementChild).toHaveClass('h-6')
  })

  it('uses global input fill on stepper buttons with background hover', () => {
    render(<Harness />)

    const decreaseButton = screen.getByLabelText('Decrease Quantity')
    expect(decreaseButton).toHaveClass('bg-input')
    expect(decreaseButton).toHaveClass('hover:bg-background')
    expect(decreaseButton).toHaveClass('hover:text-primary')
    expect(decreaseButton).toHaveClass('active:text-primary')
  })

  it('styles a single disabled stepper button with sunken fill and disabled icon tone', () => {
    render(<Harness initial={10} max={10} />)

    const increaseButton = screen.getByLabelText('Increase Quantity')
    expect(increaseButton).toBeDisabled()
    expect(increaseButton).toHaveClass('disabled:bg-sunken')
    expect(increaseButton).toHaveClass('disabled:[&_svg]:text-input-disabled')
  })

  it('styles the full stepper as sunken when both step buttons are disabled', () => {
    const { container } = render(
      <NumberStepper aria-label="Quantity" value={3} min={3} max={3} onChange={() => undefined} />,
    )

    expect(container.firstElementChild).toHaveClass('bg-sunken')
    expect(screen.getByLabelText('Quantity')).toHaveClass('text-input-disabled')
    expect(screen.getByLabelText('Decrease Quantity')).toBeDisabled()
    expect(screen.getByLabelText('Increase Quantity')).toBeDisabled()
  })

  describe('minAction', () => {
    it('disables the left control at min in default mode', () => {
      render(<Harness initial={1} />)
      expect(screen.getByLabelText('Decrease Quantity')).toBeDisabled()
    })

    it('decrements above min in remove mode', async () => {
      const user = userEvent.setup()

      function Controlled() {
        const [value, setValue] = React.useState(2)
        return (
          <NumberStepper
            aria-label="Quantity"
            value={value}
            min={1}
            max={5}
            minAction={{
              mode: 'remove',
              removeAriaLabel: 'Remove item',
              onRemove: vi.fn(),
            }}
            onChange={setValue}
          />
        )
      }

      render(<Controlled />)
      await user.click(screen.getByLabelText('Decrease Quantity'))
      expect(screen.getByLabelText('Quantity')).toHaveValue(1)
    })

    it('calls onRemove at min in remove mode without changing value', async () => {
      const user = userEvent.setup()
      const onRemove = vi.fn()

      render(
        <NumberStepper
          aria-label="Quantity"
          value={1}
          min={1}
          max={5}
          minAction={{
            mode: 'remove',
            removeAriaLabel: 'Remove item',
            onRemove,
          }}
          onChange={vi.fn()}
        />,
      )

      expect(screen.getByLabelText('Remove item')).toBeEnabled()
      await user.click(screen.getByLabelText('Remove item'))
      expect(onRemove).toHaveBeenCalledTimes(1)
    })

    it('allows removal when min equals max', async () => {
      const user = userEvent.setup()
      const onRemove = vi.fn()

      render(
        <NumberStepper
          aria-label="Quantity"
          value={1}
          min={1}
          max={1}
          minAction={{
            mode: 'remove',
            removeAriaLabel: 'Remove item',
            onRemove,
          }}
          onChange={vi.fn()}
        />,
      )

      const removeButton = screen.getByLabelText('Remove item')
      expect(removeButton).toBeEnabled()
      expect(removeButton).toHaveClass('hover:text-destructive')
      expect(screen.getByLabelText('Increase Quantity')).toBeDisabled()
      await user.click(removeButton)
      expect(onRemove).toHaveBeenCalledTimes(1)
    })

    it('disables remove at min when the whole stepper is disabled', () => {
      render(
        <NumberStepper
          aria-label="Quantity"
          value={1}
          min={1}
          max={5}
          disabled
          minAction={{
            mode: 'remove',
            removeAriaLabel: 'Remove item',
            onRemove: vi.fn(),
          }}
          onChange={vi.fn()}
        />,
      )

      expect(screen.getByLabelText('Remove item')).toBeDisabled()
    })

    it('keeps the same left button node when switching from decrement to remove', async () => {
      const user = userEvent.setup()

      function Controlled() {
        const [value, setValue] = React.useState(2)
        return (
          <NumberStepper
            aria-label="Quantity"
            value={value}
            min={1}
            max={5}
            minAction={{
              mode: 'remove',
              removeAriaLabel: 'Remove item',
              onRemove: vi.fn(),
            }}
            onChange={setValue}
          />
        )
      }

      render(<Controlled />)
      const leftButton = screen.getByLabelText('Decrease Quantity')
      await user.click(leftButton)
      expect(screen.getByLabelText('Remove item')).toBe(leftButton)
    })
  })

  it('omits border classes when borderless', () => {
    const { container } = render(
      <NumberStepper aria-label="Quantity" value={3} bordered={false} onChange={() => undefined} />,
    )
    const root = container.firstElementChild
    expect(root).not.toHaveClass('border')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(<Harness />)
    await expectNoAxeViolations(container)
  })
})
