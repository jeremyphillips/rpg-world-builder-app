'use client'

import * as React from 'react'

import { useFieldControlSize } from '../../form/context/form-section.context'
import { cn } from '../../lib/utils'
import {
  NumberStepperDecreaseButton,
  NumberStepperIncreaseButton,
} from './number-stepper-controls.client'
import type { NumberStepperMinAction } from './number-stepper-min-action.lib'
import { useNumberStepperInteraction } from './number-stepper.use.client'
import {
  numberStepperRootVariants,
  numberStepperRootWidthClass,
  resolveNumberStepperSize,
  type NumberStepperDigits,
  type NumberStepperVariantProps,
} from './number-stepper.variants'
import type { NumberInputFieldBinding } from './number-input.lib'
import {
  numberStepperInputSlotWidthClasses,
  numberStepperInputVariants,
  numberStepperPrefixedInputSlotWidthClasses,
  numberStepperPrefixedInputVariants,
  numberStepperPrefixedSlotVariants,
  numberStepperValuePrefixVariants,
  type NumberStepperSize,
} from './number-stepper.variants'

function NumberStepperValueSlot({
  valuePrefix,
  resolvedSize,
  digits,
  stepperLocked,
  inputRef,
  fieldBinding,
  ariaLabel,
  autoFocus,
  onBlur,
  onChange,
}: {
  valuePrefix?: '+'
  resolvedSize: NumberStepperSize
  digits: NumberStepperDigits
  stepperLocked: boolean
  inputRef: React.Ref<HTMLInputElement>
  fieldBinding: NumberInputFieldBinding
  ariaLabel: string
  autoFocus?: boolean
  onBlur?: React.FocusEventHandler<HTMLInputElement>
  onChange?: React.ChangeEventHandler<HTMLInputElement>
}) {
  const inputProps = {
    ...fieldBinding,
    ref: inputRef,
    type: 'number' as const,
    inputMode: 'numeric' as const,
    'aria-label': ariaLabel,
    disabled: stepperLocked,
    readOnly: stepperLocked,
    tabIndex: stepperLocked ? (-1 as const) : undefined,
    autoFocus: stepperLocked ? undefined : autoFocus,
    onBlur,
    onChange,
  }

  if (!valuePrefix) {
    return (
      <input
        {...inputProps}
        className={cn(
          numberStepperInputVariants({ size: resolvedSize, locked: stepperLocked }),
          numberStepperInputSlotWidthClasses[resolvedSize][digits],
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        numberStepperInputVariants({ size: resolvedSize, locked: stepperLocked }),
        numberStepperPrefixedInputSlotWidthClasses[resolvedSize][digits],
        numberStepperPrefixedSlotVariants(),
      )}
    >
      <span aria-hidden className={numberStepperValuePrefixVariants()}>
        {valuePrefix}
      </span>
      <input {...inputProps} className={numberStepperPrefixedInputVariants()} />
    </div>
  )
}

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
  /** Visual adornment inside the value slot. The input value stays the plain number. */
  valuePrefix?: '+'
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
  valuePrefix,
  className,
  'aria-label': ariaLabel,
  autoFocus,
  onBlur,
}: NumberStepperProps) {
  const fieldSize = useFieldControlSize()
  const resolvedSize = resolveNumberStepperSize(size, fieldSize)
  const interaction = useNumberStepperInteraction({
    value,
    onChange,
    min,
    max,
    step,
    disabled,
    minAction,
    ariaLabel,
  })

  return (
    <div
      className={cn(
        numberStepperRootVariants({
          size: resolvedSize,
          bordered,
          locked: interaction.stepperLocked,
        }),
        numberStepperRootWidthClass(resolvedSize, digits, valuePrefix),
        className,
      )}
    >
      <NumberStepperDecreaseButton
        resolvedSize={resolvedSize}
        showRemoveAtMin={interaction.showRemoveAtMin}
        leftDisabled={interaction.leftDisabled}
        leftAriaLabel={interaction.leftAriaLabel}
        onClick={interaction.handleLeftClick}
      />

      <NumberStepperValueSlot
        valuePrefix={valuePrefix}
        resolvedSize={resolvedSize}
        digits={digits}
        stepperLocked={interaction.stepperLocked}
        inputRef={interaction.inputRef}
        fieldBinding={interaction.fieldBinding}
        ariaLabel={ariaLabel}
        autoFocus={autoFocus}
        onBlur={onBlur}
        onChange={interaction.handleInputChange}
      />

      <NumberStepperIncreaseButton
        resolvedSize={resolvedSize}
        disabled={interaction.incrementDisabled}
        ariaLabel={interaction.increaseLabel}
        onClick={() => interaction.handleBump('up')}
      />
    </div>
  )
}

export type { NumberStepperDigits }
