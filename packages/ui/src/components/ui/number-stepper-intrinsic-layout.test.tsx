import type { ReactElement, ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { FormSectionProvider } from '../../form/context/form-section.context'
import { Form } from '../../form/shells/form.client'
import type { FormItem } from '../../form/field-config'
import { FieldRowAnatomyProvider } from './field-row-anatomy.context'
import { FormField } from './form-field'
import { NumberStepper } from './number-stepper.client'
import {
  numberStepperPrefixedValueSlotWidthPx,
  numberStepperRootWidthClass,
  numberStepperValueSlotWidthPx,
  type NumberStepperSize,
} from './number-stepper.variants'
import { OptionalFieldDisclosure } from './optional-field-disclosure.client'

const SIDE_BUTTON_PX: Record<NumberStepperSize, number> = {
  xs: 48,
  sm: 64,
  md: 64,
  lg: 64,
}

function expectedRootWidthPx(
  size: NumberStepperSize,
  digits: 1 | 2 | 3 | 4 | 5,
  prefixed = false,
): number {
  const slots = prefixed ? numberStepperPrefixedValueSlotWidthPx : numberStepperValueSlotWidthPx
  return slots[size][digits] + SIDE_BUTTON_PX[size]
}

function numberStepperRootForInput(input: HTMLElement): HTMLElement {
  let node: HTMLElement | null = input.parentElement
  while (node) {
    const hasStepperWidth = [...node.classList].some((token) => token.startsWith('w-[calc'))
    if (hasStepperWidth && node.classList.contains('flex-none')) return node
    node = node.parentElement
  }
  throw new Error('NumberStepper root not found')
}

function numberStepperRootFromLabel(label: string): HTMLElement {
  return numberStepperRootForInput(screen.getByLabelText(label))
}

function numberStepperRootFromControlId(controlId: string): HTMLElement {
  const input = document.getElementById(controlId)
  if (!input) throw new Error(`Missing control #${controlId}`)
  return numberStepperRootForInput(input)
}

function mockRootLayout(root: HTMLElement, width: number) {
  Object.defineProperty(root, 'getBoundingClientRect', {
    configurable: true,
    value: () =>
      ({
        width,
        height: 36,
        top: 0,
        left: 0,
        right: width,
        bottom: 36,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect,
  })
}

function expectIntrinsicRoot(
  root: HTMLElement,
  size: NumberStepperSize,
  digits: 1 | 2 | 3 | 4 | 5,
) {
  expect(root).toHaveClass('flex-none', 'self-start')
  expect(root.className).toContain(numberStepperRootWidthClass(size, digits))
  const intrinsic = expectedRootWidthPx(size, digits)
  mockRootLayout(root, intrinsic)
  expect(root.getBoundingClientRect().width).toBe(intrinsic)
  expect(root.getBoundingClientRect().width).toBeLessThan(400)
}

describe('NumberStepper intrinsic width in layout', () => {
  it('opts out of flex-col stretch with flex-none and self-start', () => {
    render(
      <div className="flex w-full max-w-[400px] flex-col" data-testid="parent">
        <NumberStepper aria-label="Quantity" value={3} digits={2} onChange={vi.fn()} />
      </div>,
    )
    const parent = screen.getByTestId('parent')
    Object.defineProperty(parent, 'offsetWidth', { configurable: true, value: 400 })

    const root = numberStepperRootFromLabel('Quantity')
    expectIntrinsicRoot(root, 'md', 2)
  })

  it.each([['sm', 2, 'sm'] as const, ['md', 1, 'md'] as const, ['lg', 3, 'lg'] as const])(
    'preserves calc width for size %s and %s digits',
    (size, digits, fieldSize) => {
      render(
        <FormSectionHarness size={fieldSize}>
          <NumberStepper
            aria-label="Tiered"
            value={digits}
            digits={digits}
            size={size}
            onChange={vi.fn()}
          />
        </FormSectionHarness>,
      )
      expectIntrinsicRoot(numberStepperRootFromLabel('Tiered'), size, digits)
    },
  )

  it('stays intrinsic inside an open OptionalFieldDisclosure stack', () => {
    render(
      <div className="w-full max-w-[400px]" data-testid="parent">
        <OptionalFieldDisclosure
          controlId="times"
          fieldLabel="Times"
          addLabel="Add repetition"
          addAccessibleName="Add repetition"
          removeLabel="Remove repetition"
          removeAccessibleName="Remove repetition"
          open
          onOpenChange={vi.fn()}
          onRemove={vi.fn()}
          size="md"
        >
          <NumberStepper
            id="times"
            stepperLabel="Times"
            aria-label="Times"
            value={2}
            digits={2}
            onChange={vi.fn()}
          />
        </OptionalFieldDisclosure>
      </div>,
    )

    expectIntrinsicRoot(numberStepperRootFromControlId('times'), 'md', 2)
  })

  it('stays intrinsic in an optional disclosure anatomy row', () => {
    render(
      <FieldRowAnatomyProvider>
        <div className="w-full max-w-[400px]">
          <OptionalFieldDisclosure
            controlId="times-row"
            fieldLabel="Times"
            addLabel="Add repetition"
            addAccessibleName="Add repetition"
            removeLabel="Remove repetition"
            removeAccessibleName="Remove repetition"
            open
            onOpenChange={vi.fn()}
            onRemove={vi.fn()}
            size="md"
          >
            <NumberStepper
              id="times-row"
              stepperLabel="Times"
              aria-label="Times row"
              value={2}
              digits={2}
              onChange={vi.fn()}
            />
          </OptionalFieldDisclosure>
        </div>
      </FieldRowAnatomyProvider>,
    )

    expectIntrinsicRoot(numberStepperRootFromControlId('times-row'), 'md', 2)
    expect(document.querySelector('[data-field-control-region]')).toBeTruthy()
  })

  it('stays intrinsic inside FormField with width auto', () => {
    render(
      <FormFieldHarness>
        <NumberStepper label="Count" id="count-field" value={2} digits={2} onChange={vi.fn()} />
      </FormFieldHarness>,
    )

    expectIntrinsicRoot(numberStepperRootFromLabel('Count'), 'md', 2)
  })

  it('stays intrinsic in a schema-driven stepper field', () => {
    const schema = z.object({ bonus: z.number() })
    const fields: FormItem[] = [
      {
        type: 'number',
        name: 'bonus',
        label: 'Natural armor bonus',
        control: 'stepper',
        width: 'auto',
        min: 1,
        defaultValue: 2,
        digits: 2,
      },
    ]

    render(<Form schema={schema} fields={fields} onSubmit={vi.fn()} className="max-w-lg" />)

    expectIntrinsicRoot(numberStepperRootFromLabel('Natural armor bonus'), 'md', 2)
  })
})

function FormSectionHarness({ children }: { size: 'sm' | 'md' | 'lg'; children: ReactNode }) {
  return (
    <FormSectionProvider density="comfortable">
      {children}
    </FormSectionProvider>
  )
}

function FormFieldHarness({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full max-w-[400px] flex-col">
      <FormField id="harness-field" label="Harness" width="auto">
        {children as ReactElement}
      </FormField>
    </div>
  )
}
