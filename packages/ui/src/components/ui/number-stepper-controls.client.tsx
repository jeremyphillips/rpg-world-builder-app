'use client'

import { Minus, Plus } from 'lucide-react'

import { ActionIcon } from './action-icon.client'
import { numberStepperButtonVariants, type NumberStepperSize } from './number-stepper.variants'
import type { IconGlyphStep } from './icon-glyph.variants'

function resolveNumberStepperLeftIconStep(size: NumberStepperSize): IconGlyphStep {
  if (size === 'xs' || size === 'sm') return 'sm'
  return 'md'
}

export function NumberStepperDecreaseButton({
  resolvedSize,
  showRemoveAtMin,
  leftDisabled,
  leftAriaLabel,
  onClick,
}: {
  resolvedSize: NumberStepperSize
  showRemoveAtMin: boolean
  leftDisabled: boolean
  leftAriaLabel: string
  onClick: () => void
}) {
  return (
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
      onClick={onClick}
    >
      {showRemoveAtMin ? (
        <ActionIcon action="remove" step={resolveNumberStepperLeftIconStep(resolvedSize)} />
      ) : (
        <Minus aria-hidden />
      )}
    </button>
  )
}

export function NumberStepperIncreaseButton({
  resolvedSize,
  disabled,
  ariaLabel,
  onClick,
}: {
  resolvedSize: NumberStepperSize
  disabled: boolean
  ariaLabel: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      tabIndex={-1}
      disabled={disabled}
      aria-label={ariaLabel}
      className={numberStepperButtonVariants({ size: resolvedSize })}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      <Plus aria-hidden />
    </button>
  )
}
