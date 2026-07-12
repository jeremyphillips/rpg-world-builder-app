'use client'

import * as React from 'react'
import { Minus, Plus } from 'lucide-react'

import { cn } from '../../lib/utils'
import { buildStepOptions, normalizeInputValue, stepNumber } from './number-input.lib'
import { useNumberInput } from './number-input.use.client'
import {
  numberStepperButtonVariants,
  numberStepperInputDigitWidths,
  numberStepperInputVariants,
  numberStepperRootVariants,
  numberStepperWidthVariants,
  resolveNumberStepperSize,
  type NumberStepperDigits,
  type NumberStepperVariantProps,
} from './number-stepper.variants'

const DECREASE_LABEL_PREFIX = 'Decrease'
const INCREASE_LABEL_PREFIX = 'Increase'

export interface NumberStepperProps extends NumberStepperVariantProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  digits?: NumberStepperDigits
  disabled?: boolean
  className?: string
  'aria-label': string
  autoFocus?: boolean
  onBlur?: React.FocusEventHandler<HTMLInputElement>
}

export function NumberStepper({
  value,
  onChange,
  min = 1,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  digits = 2,
  size,
  bordered = true,
  disabled = false,
  className,
  'aria-label': ariaLabel,
  autoFocus,
  onBlur,
}: NumberStepperProps) {
  const resolvedSize = resolveNumberStepperSize(size)
  const stepOptions = React.useMemo(
    () => buildStepOptions(step, min, max, min, max, false),
    [max, min, step],
  )
  const numericValue = Number(normalizeInputValue(value))
  const resolvedValue = Number.isFinite(numericValue) ? numericValue : min

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = Number(event.target.value)
      onChange(Number.isFinite(next) ? next : min)
    },
    [min, onChange],
  )

  const {
    inputRef,
    fieldBinding,
    incrementDisabled,
    decrementDisabled,
    onChange: handleInputChange,
  } = useNumberInput({
    disabled,
    min,
    max,
    step,
    stepperMin: min,
    stepperMax: max,
    value,
    onChange: handleChange,
  })

  const handleBump = React.useCallback(
    (direction: 'up' | 'down') => {
      if (disabled) return
      const next = stepNumber(resolvedValue, direction, stepOptions)
      onChange(next)
    },
    [disabled, onChange, resolvedValue, stepOptions],
  )

  const decreaseLabel = `${DECREASE_LABEL_PREFIX} ${ariaLabel}`
  const increaseLabel = `${INCREASE_LABEL_PREFIX} ${ariaLabel}`

  return (
    <div
      className={cn(
        numberStepperRootVariants({ size: resolvedSize, bordered }),
        numberStepperWidthVariants[resolvedSize][digits],
        className,
      )}
    >
      <button
        type="button"
        tabIndex={-1}
        disabled={disabled || decrementDisabled}
        aria-label={decreaseLabel}
        className={numberStepperButtonVariants({ size: resolvedSize })}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => handleBump('down')}
      >
        <Minus aria-hidden />
      </button>

      <input
        {...fieldBinding}
        ref={inputRef}
        type="number"
        inputMode="numeric"
        aria-label={ariaLabel}
        disabled={disabled}
        autoFocus={autoFocus}
        onBlur={onBlur}
        onChange={handleInputChange}
        className={cn(
          numberStepperInputVariants({ size: resolvedSize }),
          numberStepperInputDigitWidths[digits],
        )}
      />

      <button
        type="button"
        tabIndex={-1}
        disabled={disabled || incrementDisabled}
        aria-label={increaseLabel}
        className={numberStepperButtonVariants({ size: resolvedSize })}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => handleBump('up')}
      >
        <Plus aria-hidden />
      </button>
    </div>
  )
}

export type { NumberStepperDigits }
