'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'

import { cn } from '../../lib/utils'
import {
  numberInputStepperButtonVariants,
  numberInputStepperVariants,
  type NumberInputVariantProps,
} from './number-input.variants'

const INCREMENT_LABEL = 'Increment'
const DECREMENT_LABEL = 'Decrement'

interface NumberInputSteppersProps extends Pick<NumberInputVariantProps, 'size' | 'grouped'> {
  disabled?: boolean
  incrementDisabled: boolean
  decrementDisabled: boolean
  onBump: (direction: 'up' | 'down') => void
}

export function NumberInputSteppers({
  size,
  grouped = false,
  disabled,
  incrementDisabled,
  decrementDisabled,
  onBump,
}: NumberInputSteppersProps) {
  return (
    <div
      className={cn(
        numberInputStepperVariants({ size, grouped }),
        'pointer-events-none opacity-0 transition-opacity',
        'group-hover:pointer-events-auto group-hover:opacity-100',
        'group-focus-within:pointer-events-auto group-focus-within:opacity-100',
        disabled && 'hidden',
      )}
    >
      <button
        type="button"
        tabIndex={-1}
        disabled={incrementDisabled}
        aria-label={INCREMENT_LABEL}
        className={numberInputStepperButtonVariants({ size })}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => onBump('up')}
      >
        <ChevronUp aria-hidden />
      </button>
      <button
        type="button"
        tabIndex={-1}
        disabled={decrementDisabled}
        aria-label={DECREMENT_LABEL}
        className={numberInputStepperButtonVariants({ size })}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => onBump('down')}
      >
        <ChevronDown aria-hidden />
      </button>
    </div>
  )
}
