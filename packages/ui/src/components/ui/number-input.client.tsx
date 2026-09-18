'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { NumberInputSteppers } from './number-input-steppers.client'
import { useNumberInput } from './number-input.use.client'
import { resolveDigitInlineSizeClasses } from './field-digit-metrics'
import { fieldGroupedControlSizeClasses } from './field-sizing.variants'
import { fieldControlVariants } from './field-control.variants'
import {
  numberInputFieldVariants,
  numberInputRootVariants,
  type NumberInputDigits,
  type NumberInputVariantProps,
} from './number-input.variants'

const numberInputAppearanceClasses =
  '[appearance:textfield] tabular-nums [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'

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
  /** When true, renders en-US thousand separators while storing plain numbers. */
  formatGrouped?: boolean
  /** When true, omits stepper controls and trailing stepper padding. */
  hideSteppers?: boolean
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
      formatGrouped = false,
      hideSteppers = false,
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref,
  ) => {
    const {
      inputRef,
      fieldBinding,
      incrementDisabled,
      decrementDisabled,
      bump,
      onChange: handleChange,
    } = useNumberInput({
      disabled,
      min,
      max,
      step,
      stepperMin,
      stepperMax,
      formatGrouped,
      value,
      defaultValue,
      onChange,
    })

    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)

    const resolvedSize = size ?? 'md'

    return (
      <div
        className={cn(
          numberInputRootVariants(),
          digits ? resolveDigitInlineSizeClasses(digits, resolvedSize) : 'w-full',
          rootClassName,
        )}
      >
        <input
          {...props}
          {...fieldBinding}
          ref={inputRef}
          disabled={disabled}
          onChange={handleChange}
          className={cn(
            hideSteppers && grouped
              ? cn(
                  fieldGroupedControlSizeClasses[resolvedSize],
                  'min-w-0 w-full border-0 bg-transparent shadow-none rounded-none focus-visible:ring-0 focus-visible:ring-offset-0',
                )
              : hideSteppers
                ? cn(fieldControlVariants({ size: resolvedSize }), numberInputAppearanceClasses)
                : numberInputFieldVariants({ size, grouped }),
            digits && 'min-w-0 w-full',
            className,
          )}
        />

        {hideSteppers ? null : (
          <NumberInputSteppers
            size={size}
            grouped={grouped}
            disabled={disabled}
            incrementDisabled={incrementDisabled}
            decrementDisabled={decrementDisabled}
            onBump={bump}
          />
        )}
      </div>
    )
  },
)
NumberInput.displayName = 'NumberInput'

export type { NumberInputDigits }
export { NumberInput }
