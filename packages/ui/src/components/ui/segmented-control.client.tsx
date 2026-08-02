'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { Text } from './text'
import {
  segmentedControlLabelVariants,
  segmentedControlMetadataVariants,
  segmentedControlRootVariants,
  segmentedControlSegmentVariants,
} from './segmented-control.variants'

export type SegmentedControlOption<TValue extends string> = {
  value: TValue
  label: string
  disabled?: boolean
  metadata?: string
}

export type SegmentedControlSegmentWidth = 'equal' | 'auto'

export type SegmentedControlProps<TValue extends string> = {
  value: TValue
  options: readonly SegmentedControlOption<TValue>[]
  onValueChange: (value: TValue) => void
  fullWidth?: boolean
  /** `equal` stretches segments and truncates labels; `auto` sizes each segment to its label. */
  segmentWidth?: SegmentedControlSegmentWidth
  'aria-label'?: string
  className?: string
}

function resolveNextEnabledIndex<TValue extends string>(
  options: readonly SegmentedControlOption<TValue>[],
  startIndex: number,
  direction: 1 | -1,
): number {
  const count = options.length
  for (let offset = 1; offset <= count; offset += 1) {
    const index = (startIndex + direction * offset + count) % count
    if (!options[index]?.disabled) return index
  }
  return startIndex
}

export function SegmentedControl<TValue extends string>({
  value,
  options,
  onValueChange,
  fullWidth = false,
  segmentWidth = 'equal',
  'aria-label': ariaLabel,
  className,
}: SegmentedControlProps<TValue>) {
  const buttonRefs = React.useRef<Array<HTMLButtonElement | null>>([])

  const activeIndex = options.findIndex((option) => option.value === value)

  const focusSegment = (index: number) => {
    buttonRefs.current[index]?.focus()
  }

  const selectSegment = (index: number) => {
    const option = options[index]
    if (!option || option.disabled) return
    onValueChange(option.value)
    focusSegment(index)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown': {
        event.preventDefault()
        selectSegment(resolveNextEnabledIndex(options, index, 1))
        break
      }
      case 'ArrowLeft':
      case 'ArrowUp': {
        event.preventDefault()
        selectSegment(resolveNextEnabledIndex(options, index, -1))
        break
      }
      case 'Home': {
        event.preventDefault()
        const firstEnabled = options.findIndex((option) => !option.disabled)
        if (firstEnabled >= 0) selectSegment(firstEnabled)
        break
      }
      case 'End': {
        event.preventDefault()
        const lastEnabled = [...options].reverse().findIndex((option) => !option.disabled)
        if (lastEnabled >= 0) selectSegment(options.length - 1 - lastEnabled)
        break
      }
      default:
        break
    }
  }

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(segmentedControlRootVariants({ fullWidth }), className)}
    >
      {options.map((option, index) => {
        const isActive = option.value === value
        return (
          <button
            key={option.value}
            ref={(node) => {
              buttonRefs.current[index] = node
            }}
            type="button"
            aria-pressed={isActive}
            disabled={option.disabled}
            tabIndex={index === (activeIndex >= 0 ? activeIndex : 0) ? 0 : -1}
            className={segmentedControlSegmentVariants({ active: isActive, segmentWidth })}
            onClick={() => selectSegment(index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            <span className={segmentedControlLabelVariants({ segmentWidth })}>{option.label}</span>
            {option.metadata ? (
              <Text as="span" variant="muted" className={segmentedControlMetadataVariants()}>
                {option.metadata}
              </Text>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
