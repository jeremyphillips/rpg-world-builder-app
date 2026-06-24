'use client'

import * as React from 'react'
import { parseGroupedNumber } from '@rpg/contracts/primitives'

import {
  buildStepOptions,
  countDigitsBefore,
  createSyntheticNumberChangeEvent,
  dispatchNativeNumberStep,
  isStepDisabled,
  normalizeInputValue,
  resolveNumberInputFieldBinding,
  restoreGroupedInputCursor,
  stepNumber,
} from './number-input.lib'

export interface UseNumberInputOptions {
  disabled?: boolean
  min?: number | string
  max?: number | string
  step?: number | string
  stepperMin?: number
  stepperMax?: number
  formatGrouped?: boolean
  value?: string | number | readonly string[]
  defaultValue?: string | number | readonly string[]
  onChange?: React.ChangeEventHandler<HTMLInputElement>
}

export function useNumberInput({
  disabled,
  min,
  max,
  step = 1,
  stepperMin,
  stepperMax,
  formatGrouped = false,
  value,
  defaultValue,
  onChange,
}: UseNumberInputOptions) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const stepOptions = buildStepOptions(step, min, max, stepperMin, stepperMax, formatGrouped)
  const currentValue = normalizeInputValue(value ?? defaultValue)

  const emitChange = React.useCallback(
    (next: number | undefined) => {
      onChange?.(createSyntheticNumberChangeEvent(next))
    },
    [onChange],
  )

  const handleGroupedChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = event.target.value
      const cursorPos = event.target.selectionStart ?? 0
      const digitsBefore = countDigitsBefore(raw, cursorPos)
      const parsed = parseGroupedNumber(raw)

      emitChange(parsed)

      requestAnimationFrame(() => {
        restoreGroupedInputCursor(inputRef.current, parsed, digitsBefore)
      })
    },
    [emitChange],
  )

  const bump = React.useCallback(
    (direction: 'up' | 'down') => {
      if (disabled) return

      const next = stepNumber(currentValue, direction, stepOptions)

      if (formatGrouped) {
        emitChange(next)
        inputRef.current?.focus()
        return
      }

      const input = inputRef.current
      if (!input) return
      dispatchNativeNumberStep(input, next)
    },
    [currentValue, disabled, emitChange, formatGrouped, stepOptions],
  )

  const fieldBinding = resolveNumberInputFieldBinding({
    formatGrouped,
    value,
    defaultValue,
    currentValue,
    min,
    max,
    step,
  })

  return {
    inputRef,
    fieldBinding,
    onChange: formatGrouped ? handleGroupedChange : onChange,
    incrementDisabled: Boolean(disabled) || isStepDisabled(currentValue, 'up', stepOptions),
    decrementDisabled: Boolean(disabled) || isStepDisabled(currentValue, 'down', stepOptions),
    bump,
  }
}
