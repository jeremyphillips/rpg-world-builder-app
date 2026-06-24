'use client'

import * as React from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

import { cn } from '../../lib/utils'
import {
  isStepDisabled,
  resolveNumberBounds,
  stepNumber,
  type StepNumberOptions,
} from './number-input.lib'
import {
  numberInputDigitsVariants,
  numberInputFieldVariants,
  numberInputRootVariants,
  numberInputStepperButtonVariants,
  numberInputStepperVariants,
  type NumberInputDigits,
  type NumberInputVariantProps,
} from './number-input.variants'

const INCREMENT_LABEL = 'Increment'
const DECREMENT_LABEL = 'Decrement'

function normalizeInputValue(
  raw: string | number | readonly string[] | undefined,
): string | number | undefined {
  if (raw === undefined) return undefined
  if (typeof raw === 'number' || typeof raw === 'string') return raw
  return raw[0]
}

export interface NumberInputProps
  extends Omit<React.ComponentProps<'input'>, 'size' | 'type'>, NumberInputVariantProps {
  /**
   * Bounds enforced by stepper clicks only — not set as HTML attributes. Use in
   * schema-driven forms so users can type through in-progress values.
   */
  stepperMin?: number
  stepperMax?: number
  /** When true, styles for embedding inside a grouped control such as InputSelectField. */
  grouped?: boolean
  rootClassName?: string
  /**
   * Maximum digit count the input should visually accommodate. Sets the root
   * width to `calc(N×1ch + padding + stepper)` using the current size's token
   * offsets, so the width scales automatically with font-size.
   */
  digits?: NumberInputDigits
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      className,
      size,
      disabled,
      min,
      max,
      step = 1,
      stepperMin,
      stepperMax,
      grouped = false,
      rootClassName,
      digits,
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref,
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)

    const bounds = resolveNumberBounds(
      typeof min === 'number' ? min : undefined,
      typeof max === 'number' ? max : undefined,
      stepperMin,
      stepperMax,
    )
    const stepOptions: StepNumberOptions = { step: Number(step) || 1, ...bounds }

    const currentValue = normalizeInputValue(value ?? defaultValue)

    function bump(direction: 'up' | 'down') {
      if (disabled) return

      const next = stepNumber(currentValue, direction, stepOptions)
      const input = inputRef.current
      if (!input) return

      const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
      valueSetter?.call(input, String(next))
      input.dispatchEvent(new Event('input', { bubbles: true }))
      input.dispatchEvent(new Event('change', { bubbles: true }))
      input.focus()
    }

    const incrementDisabled = disabled || isStepDisabled(currentValue, 'up', stepOptions)
    const decrementDisabled = disabled || isStepDisabled(currentValue, 'down', stepOptions)

    return (
      <div
        className={cn(
          numberInputRootVariants(),
          digits && numberInputDigitsVariants[size ?? 'md'][digits],
          rootClassName,
        )}
      >
        <input
          type="number"
          inputMode="numeric"
          ref={inputRef}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          className={cn(numberInputFieldVariants({ size, grouped }), className)}
          {...props}
        />

        <div
          className={cn(
            numberInputStepperVariants({ size, grouped }),
            'pointer-events-none opacity-0 transition-opacity',
            'group-hover:pointer-events-auto group-hover:opacity-100',
            'group-focus-within:pointer-events-auto group-focus-within:opacity-100',
            disabled && 'hidden',
          )}
        >
          <button
            type="button"
            tabIndex={-1}
            disabled={incrementDisabled}
            aria-label={INCREMENT_LABEL}
            className={numberInputStepperButtonVariants({ size })}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => bump('up')}
          >
            <ChevronUp aria-hidden />
          </button>
          <button
            type="button"
            tabIndex={-1}
            disabled={decrementDisabled}
            aria-label={DECREMENT_LABEL}
            className={numberInputStepperButtonVariants({ size })}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => bump('down')}
          >
            <ChevronDown aria-hidden />
          </button>
        </div>
      </div>
    )
  },
)
NumberInput.displayName = 'NumberInput'

export type { NumberInputDigits }
export { NumberInput }
