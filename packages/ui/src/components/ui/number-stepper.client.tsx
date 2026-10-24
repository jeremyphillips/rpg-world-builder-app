'use client'

import * as React from 'react'

import { useFieldControlSize } from '../../form/context/form-section.context'
import { cn } from '../../lib/utils'
import { FormField } from './form-field'
import {
  NumberStepperDecreaseButton,
  NumberStepperIncreaseButton,
  NumberStepperStepButton,
} from './number-stepper-controls.client'
import type { NumberStepperMinAction } from './number-stepper-min-action.lib'
import {
  numberStepperSignPrefixChar,
  numberStepperMagnitude,
  numberStepperUsesPrefixedValueSlot,
  type NumberStepperSignDisplay,
} from './number-stepper-sign-display.lib'
import { useNumberStepperInteraction } from './number-stepper.use.client'
import {
  numberStepperRootVariants,
  numberStepperRootWidthClass,
  resolveNumberStepperSize,
  type NumberStepperDigits,
  type NumberStepperVariantProps,
} from './number-stepper.variants'
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
  signDisplay,
  resolvedValue,
  resolvedSize,
  digits,
  stepperLocked,
  inputRef,
  fieldBinding,
  ariaLabel,
  ariaValueText,
  autoFocus,
  onBlur,
  onChange,
  ariaInvalid,
}: {
  signDisplay: NumberStepperSignDisplay
  resolvedValue: number
  resolvedSize: NumberStepperSize
  digits: NumberStepperDigits
  stepperLocked: boolean
  inputRef: React.Ref<HTMLInputElement>
  fieldBinding: {
    type: 'text' | 'number'
    inputMode: 'decimal' | 'numeric'
    value: string | number | readonly string[] | undefined
    min?: number | string
    max?: number | string
    step?: number | string
  }
  ariaLabel: string
  ariaValueText?: string
  autoFocus?: boolean
  onBlur?: React.FocusEventHandler<HTMLInputElement>
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  ariaInvalid?: React.AriaAttributes['aria-invalid']
}) {
  const inputProps = {
    ref: inputRef,
    inputMode: 'numeric' as const,
    'aria-label': ariaLabel,
    ...(ariaValueText ? { 'aria-valuetext': ariaValueText } : {}),
    disabled: stepperLocked,
    readOnly: stepperLocked,
    'aria-invalid': ariaInvalid,
    tabIndex: stepperLocked ? (-1 as const) : undefined,
    autoFocus: stepperLocked ? undefined : autoFocus,
    onBlur,
    onChange,
  }

  if (!numberStepperUsesPrefixedValueSlot(signDisplay)) {
    return (
      <input
        {...inputProps}
        type="number"
        value={fieldBinding.value}
        min={fieldBinding.min}
        max={fieldBinding.max}
        step={fieldBinding.step}
        className={cn(
          numberStepperInputVariants({ size: resolvedSize, locked: stepperLocked }),
          numberStepperInputSlotWidthClasses[resolvedSize][digits],
        )}
      />
    )
  }

  const prefixChar =
    signDisplay === 'signed-prefix' ? numberStepperSignPrefixChar(resolvedValue) : '+'

  const centerValue =
    signDisplay === 'signed-prefix'
      ? String(numberStepperMagnitude(resolvedValue))
      : fieldBinding.value

  return (
    <div
      className={cn(
        numberStepperInputVariants({ size: resolvedSize, locked: stepperLocked }),
        numberStepperPrefixedInputSlotWidthClasses[resolvedSize][digits],
        numberStepperPrefixedSlotVariants,
      )}
    >
      <span aria-hidden className={numberStepperValuePrefixVariants}>
        {prefixChar}
      </span>
      <input
        {...inputProps}
        type="text"
        value={centerValue}
        className={numberStepperPrefixedInputVariants}
      />
    </div>
  )
}

function NumberStepperControl({
  value,
  onChange,
  min,
  max,
  step,
  digits,
  size,
  bordered,
  disabled,
  minAction,
  signDisplay,
  className,
  ariaLabel,
  autoFocus,
  onBlur,
  ariaInvalid,
}: {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  digits: NumberStepperDigits
  size?: NumberStepperVariantProps['size']
  bordered?: boolean
  disabled: boolean
  minAction?: NumberStepperMinAction
  signDisplay?: NumberStepperSignDisplay
  className?: string
  ariaLabel: string
  autoFocus?: boolean
  onBlur?: React.FocusEventHandler<HTMLInputElement>
  ariaInvalid?: React.AriaAttributes['aria-invalid']
}) {
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
    signDisplay,
  })

  const usesPrefix = numberStepperUsesPrefixedValueSlot(interaction.resolvedSignDisplay)

  return (
    <div
      className={cn(
        numberStepperRootVariants({
          size: resolvedSize,
          bordered,
          locked: interaction.stepperLocked,
        }),
        numberStepperRootWidthClass(resolvedSize, digits, usesPrefix),
        className,
      )}
      aria-invalid={ariaInvalid}
    >
      <NumberStepperDecreaseButton
        resolvedSize={resolvedSize}
        showRemoveAtMin={interaction.showRemoveAtMin}
        leftDisabled={interaction.leftDisabled}
        leftAriaLabel={interaction.leftAriaLabel}
        onClick={interaction.handleLeftClick}
      />

      <NumberStepperValueSlot
        signDisplay={interaction.resolvedSignDisplay}
        resolvedValue={interaction.resolvedValue}
        resolvedSize={resolvedSize}
        digits={digits}
        stepperLocked={interaction.stepperLocked}
        inputRef={interaction.inputRef}
        fieldBinding={interaction.fieldBinding}
        ariaLabel={ariaLabel}
        ariaValueText={interaction.valueSlotAriaValueText}
        autoFocus={autoFocus}
        onBlur={onBlur}
        onChange={interaction.handleInputChange}
        ariaInvalid={ariaInvalid}
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

export type { NumberStepperMinAction, NumberStepperSignDisplay }

export interface NumberStepperProps extends NumberStepperVariantProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  digits?: NumberStepperDigits
  disabled?: boolean
  minAction?: NumberStepperMinAction
  /**
   * Value-slot sign presentation. `signed-prefix` shows a dynamic +/− adornment and magnitude in
   * the input (use when min &lt; 0). `positive-prefix` is for non-negative additive stacks only.
   */
  signDisplay?: NumberStepperSignDisplay
  /** Visible label; associates the control via `id` and reuses the label for stepper aria-label. */
  label?: string
  id?: string
  className?: string
  'aria-label': string
  'aria-invalid'?: React.AriaAttributes['aria-invalid']
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
  signDisplay,
  label,
  id,
  className,
  'aria-label': ariaLabel,
  'aria-invalid': ariaInvalid,
  autoFocus,
  onBlur,
}: NumberStepperProps) {
  const control = (
    <NumberStepperControl
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      step={step}
      digits={digits}
      size={size}
      bordered={bordered ?? true}
      disabled={disabled}
      minAction={minAction}
      signDisplay={signDisplay}
      className={className}
      ariaLabel={label ?? ariaLabel}
      ariaInvalid={ariaInvalid}
      autoFocus={autoFocus}
      onBlur={onBlur}
    />
  )

  if (label && id) {
    return (
      <FormField id={id} label={label} width="auto">
        {control}
      </FormField>
    )
  }

  return control
}

export type { NumberStepperDigits }

export { NumberStepperStepButton }
