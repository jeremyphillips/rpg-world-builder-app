'use client'

import * as React from 'react'

import { parseNumberStepperChangeValue } from './number-stepper-change.lib'
import { buildStepOptions, normalizeInputValue, stepNumber } from './number-input.lib'
import { useNumberInput } from './number-input.use.client'
import {
  numberStepperInputValueForBinding,
  numberStepperValueSlotAriaValueText,
  resolveNumberStepperSignDisplay,
  warnIfPositivePrefixWithNegativeMin,
  type NumberStepperSignDisplay,
} from './number-stepper-sign-display.lib'
import {
  resolveNumberStepperActions,
  type NumberStepperMinAction,
} from './number-stepper-min-action.lib'

const DECREASE_LABEL_PREFIX = 'Decrease'
const INCREASE_LABEL_PREFIX = 'Increase'

export function useNumberStepperInteraction(args: {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  disabled: boolean
  minAction?: NumberStepperMinAction
  ariaLabel: string
  signDisplay?: NumberStepperSignDisplay
}) {
  const { value, onChange, min, max, step, disabled, minAction, ariaLabel, signDisplay } = args

  const resolvedSignDisplay = resolveNumberStepperSignDisplay(signDisplay)

  React.useEffect(() => {
    warnIfPositivePrefixWithNegativeMin(resolvedSignDisplay, min)
  }, [min, resolvedSignDisplay])

  const stepOptions = React.useMemo(
    () => buildStepOptions(step, min, max, min, max, false),
    [max, min, step],
  )
  const numericValue = Number(normalizeInputValue(value))
  const resolvedValue = Number.isFinite(numericValue) ? numericValue : min

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(
        parseNumberStepperChangeValue({
          rawValue: event.target.value,
          signDisplay: resolvedSignDisplay,
          resolvedValue,
          min,
          max,
        }),
      )
    },
    [max, min, onChange, resolvedSignDisplay, resolvedValue],
  )

  const numberInput = useNumberInput({
    disabled,
    min,
    max,
    step,
    stepperMin: min,
    stepperMax: max,
    value: numberStepperInputValueForBinding(resolvedSignDisplay, resolvedValue, value),
    onChange: handleChange,
  })

  const handleBump = React.useCallback(
    (direction: 'up' | 'down') => {
      if (disabled) return
      onChange(stepNumber(resolvedValue, direction, stepOptions))
    },
    [disabled, onChange, resolvedValue, stepOptions],
  )

  const showRemoveAtMin = (minAction?.mode ?? 'disable') === 'remove' && resolvedValue === min
  const stepperActions = resolveNumberStepperActions({
    minAction,
    min,
    max,
    value: resolvedValue,
    disabled,
  })

  const leftAriaLabel =
    showRemoveAtMin && minAction?.mode === 'remove'
      ? minAction.removeAriaLabel
      : `${DECREASE_LABEL_PREFIX} ${ariaLabel}`

  const handleLeftClick = React.useCallback(() => {
    if (stepperActions.canRemoveAtMin && minAction?.mode === 'remove') {
      minAction.onRemove()
      return
    }
    handleBump('down')
  }, [handleBump, minAction, stepperActions.canRemoveAtMin])

  return {
    resolvedValue,
    resolvedSignDisplay,
    showRemoveAtMin,
    leftDisabled: stepperActions.leftDisabled,
    stepperLocked: stepperActions.stepperLocked,
    incrementDisabled: disabled || numberInput.incrementDisabled,
    leftAriaLabel,
    increaseLabel: `${INCREASE_LABEL_PREFIX} ${ariaLabel}`,
    handleLeftClick,
    handleBump,
    inputRef: numberInput.inputRef,
    fieldBinding: numberInput.fieldBinding,
    handleInputChange: numberInput.onChange,
    valueSlotAriaValueText: numberStepperValueSlotAriaValueText(resolvedSignDisplay, resolvedValue),
  }
}
