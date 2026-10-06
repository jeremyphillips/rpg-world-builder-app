'use client'

import * as React from 'react'

import { buildStepOptions, normalizeInputValue, stepNumber } from './number-input.lib'
import { useNumberInput } from './number-input.use.client'
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
}) {
  const { value, onChange, min, max, step, disabled, minAction, ariaLabel } = args

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

  const numberInput = useNumberInput({
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
  }
}
