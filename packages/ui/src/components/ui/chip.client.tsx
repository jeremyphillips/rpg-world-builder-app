'use client'
import { Icon } from './icon/icon'

import * as React from 'react'

import { cn } from '../../lib/utils'
import type { ChipSize } from './chip.lib'
import { chipRemoveButtonVariants, resolveChipSizeClassName } from './chip.variants'

export type { ChipSize }

type ChipBaseProps = {
  children: React.ReactNode
  disabled?: boolean
  className?: string
  id?: string
  /** Override auto-injected leading check on selectable/selected only when a real use case exists. */
  leadingIcon?: React.ReactNode
}

export type ChipSelectableProps = ChipBaseProps & {
  mode: 'selectable'
  size?: ChipSize
  selected: boolean
  onSelectedChange: (selected: boolean) => void
  selectionRole?: 'checkbox' | 'radio'
  onRemove?: never
  removeLabel?: never
}

export type ChipRemovableProps = ChipBaseProps & {
  mode: 'removable'
  onRemove: () => void
  removeLabel: string
  size?: ChipSize
  selected?: never
  onSelectedChange?: never
  selectionRole?: never
}

export type ChipProps = ChipSelectableProps | ChipRemovableProps

function ChipLeadingCheck() {
  return <Icon name="check" size="owner" className="shrink-0" />
}

function SelectableChip({
  children,
  id,
  size = 'md',
  selected,
  onSelectedChange,
  selectionRole = 'checkbox',
  disabled,
  className,
  leadingIcon,
}: ChipSelectableProps) {
  const resolvedLeadingIcon =
    selected && leadingIcon === undefined ? <ChipLeadingCheck /> : leadingIcon

  return (
    <button
      id={id}
      type="button"
      role={selectionRole}
      aria-checked={selected}
      disabled={disabled}
      className={cn(
        'ui-pill',
        'ui-chip',
        resolveChipSizeClassName(size),
        'ui-chip--interactive ui-focus-ring',
        selected && 'ui-chip--selected',
        className,
      )}
      onClick={() => onSelectedChange(!selected)}
    >
      {resolvedLeadingIcon ? (
        <span aria-hidden className="inline-flex shrink-0 leading-none">
          {resolvedLeadingIcon}
        </span>
      ) : null}
      <span className="truncate">{children}</span>
    </button>
  )
}

function RemovableChip({
  children,
  size = 'md',
  onRemove,
  removeLabel,
  disabled,
  className,
}: ChipRemovableProps) {
  return (
    <span
      className={cn(
        'ui-pill',
        'ui-chip',
        'ui-chip--removable',
        'ui-border--default',
        resolveChipSizeClassName(size, true),
        className,
      )}
    >
      <span className="truncate pl-0.5">{children}</span>
      <button
        type="button"
        className={chipRemoveButtonVariants({ size })}
        aria-label={removeLabel}
        disabled={disabled}
        onClick={(event) => {
          event.stopPropagation()
          onRemove()
        }}
      >
        <Icon name="x" size="owner" />
      </button>
    </span>
  )
}

export function Chip(props: ChipProps) {
  if (props.mode === 'selectable') {
    return <SelectableChip {...props} />
  }

  return <RemovableChip {...props} />
}
