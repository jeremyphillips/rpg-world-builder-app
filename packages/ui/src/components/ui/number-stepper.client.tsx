'use client'

import * as React from 'react'
import { Minus, Plus } from 'lucide-react'

import { useFieldControlSize } from '../../form/context/form-section.context'
import { cn } from '../../lib/utils'
import { ActionIcon } from './action-icon.client'
import { buildStepOptions, normalizeInputValue, stepNumber } from './number-input.lib'
import { useNumberInput } from './number-input.use.client'
import {
  resolveNumberStepperActions,
  type NumberStepperMinAction,
} from './number-stepper-min-action.lib'
import {
  numberStepperButtonVariants,
  numberStepperInputSlotWidthClasses,
  numberStepperInputVariants,
  numberStepperRootVariants,
  numberStepperWidthVariants,
  resolveNumberStepperSize,
  type NumberStepperDigits,
  type NumberStepperSize,
  type NumberStepperVariantProps,
} from './number-stepper.variants'
import type { IconGlyphStep } from './icon-glyph.variants'

function resolveNumberStepperLeftIconStep(size: NumberStepperSize): IconGlyphStep {
  if (size === 'xs' || size === 'sm') return 'sm'
  return 'md'
}

const DECREASE_LABEL_PREFIX = 'Decrease'
const INCREASE_LABEL_PREFIX = 'Increase'

export type { NumberStepperMinAction }

export interface NumberStepperProps extends NumberStepperVariantProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  digits?: NumberStepperDigits
  disabled?: boolean
  minAction?: NumberStepperMinAction
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
  minAction,
  className,
  'aria-label': ariaLabel,
  autoFocus,
  onBlur,
}: NumberStepperProps) {
  const fieldSize = useFieldControlSize()
  const resolvedSize = resolveNumberStepperSize(size, fieldSize)
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

  const minMode = minAction?.mode ?? 'disable'
  const showRemoveAtMin = minMode === 'remove' && resolvedValue === min

  const { canRemoveAtMin, leftDisabled, stepperLocked } = resolveNumberStepperActions({
    minAction,
    min,
    max,
    value: resolvedValue,
    disabled,
  })

  const leftAriaLabel =
    showRemoveAtMin && minAction?.mode === 'remove' ? minAction.removeAriaLabel : decreaseLabel

  const handleLeftClick = React.useCallback(() => {
    if (canRemoveAtMin && minAction?.mode === 'remove') {
      minAction.onRemove()
      return
    }
    handleBump('down')
  }, [canRemoveAtMin, handleBump, minAction])

  const incrementButtonDisabled = disabled || incrementDisabled

  return (
    <div
      className={cn(
        numberStepperRootVariants({ size: resolvedSize, bordered, locked: stepperLocked }),
        numberStepperWidthVariants[resolvedSize][digits],
        className,
      )}
    >
      <button
        type="button"
        tabIndex={-1}
        disabled={leftDisabled}
        aria-label={leftAriaLabel}
        className={numberStepperButtonVariants({
          size: resolvedSize,
          minBoundary: showRemoveAtMin ? 'remove' : 'default',
        })}
        onMouseDown={(event) => event.preventDefault()}
        onClick={handleLeftClick}
      >
        {showRemoveAtMin ? (
          <ActionIcon action="remove" step={resolveNumberStepperLeftIconStep(resolvedSize)} />
        ) : (
          <Minus aria-hidden />
        )}
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
          numberStepperInputVariants({ size: resolvedSize, locked: stepperLocked }),
          numberStepperInputSlotWidthClasses[resolvedSize][digits],
        )}
      />

      <button
        type="button"
        tabIndex={-1}
        disabled={incrementButtonDisabled}
        aria-label={increaseLabel}
        className={numberStepperButtonVariants({ size: resolvedSize, minBoundary: 'default' })}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => handleBump('up')}
      >
        <Plus aria-hidden />
      </button>
    </div>
  )
}

export type { NumberStepperDigits }
