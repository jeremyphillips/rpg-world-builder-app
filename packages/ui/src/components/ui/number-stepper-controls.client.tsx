'use client'
import { Icon } from './icon/icon'

import { ActionIcon } from './action-icon.client'
import {
  numberStepperButtonVariants,
  type NumberStepperButtonAppearance,
  type NumberStepperSize,
} from './number-stepper.variants'
import type { IconSize } from './icon/icon.types'

function resolveNumberStepperLeftIconSize(size: NumberStepperSize): IconSize {
  if (size === 'xs' || size === 'sm') return 'sm'
  return 'md'
}

export function NumberStepperDecreaseButton({
  resolvedSize,
  showRemoveAtMin,
  leftDisabled,
  leftAriaLabel,
  appearance = 'default',
  onClick,
}: {
  resolvedSize: NumberStepperSize
  showRemoveAtMin: boolean
  leftDisabled: boolean
  leftAriaLabel: string
  appearance?: NumberStepperButtonAppearance
  onClick: () => void
}) {
  return (
    <button
      type="button"
      tabIndex={-1}
      disabled={leftDisabled}
      aria-label={leftAriaLabel}
      className={numberStepperButtonVariants({
        appearance,
        size: resolvedSize,
        minBoundary: showRemoveAtMin ? 'remove' : 'default',
      })}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {showRemoveAtMin ? (
        <ActionIcon action="remove" size={resolveNumberStepperLeftIconSize(resolvedSize)} />
      ) : (
        <Icon name="minus" size="owner" />
      )}
    </button>
  )
}

export function NumberStepperStepButton({
  direction,
  disabled,
  size,
  appearance = 'default',
  'aria-label': ariaLabel,
  onClick,
}: {
  direction: 'increase' | 'decrease'
  disabled: boolean
  size: NumberStepperSize
  appearance?: NumberStepperButtonAppearance
  'aria-label': string
  onClick: () => void
}) {
  if (direction === 'decrease') {
    return (
      <NumberStepperDecreaseButton
        resolvedSize={size}
        showRemoveAtMin={false}
        leftDisabled={disabled}
        leftAriaLabel={ariaLabel}
        appearance={appearance}
        onClick={onClick}
      />
    )
  }

  return (
    <NumberStepperIncreaseButton
      resolvedSize={size}
      disabled={disabled}
      ariaLabel={ariaLabel}
      appearance={appearance}
      onClick={onClick}
    />
  )
}

export function NumberStepperIncreaseButton({
  resolvedSize,
  disabled,
  ariaLabel,
  appearance = 'default',
  onClick,
}: {
  resolvedSize: NumberStepperSize
  disabled: boolean
  ariaLabel: string
  appearance?: NumberStepperButtonAppearance
  onClick: () => void
}) {
  return (
    <button
      type="button"
      tabIndex={-1}
      disabled={disabled}
      aria-label={ariaLabel}
      className={numberStepperButtonVariants({ appearance, size: resolvedSize })}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      <Icon name="plus" size="owner" />
    </button>
  )
}
