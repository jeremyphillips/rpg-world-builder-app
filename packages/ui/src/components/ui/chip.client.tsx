'use client'

import { Check, X } from 'lucide-react'
import * as React from 'react'

import { cn } from '../../lib/utils'
import type { CompactLabelSize } from './compact-label.lib'
import { chipRemoveButtonVariants, resolveCompactLabelClassName } from './compact-label.variants'
import { chipLeadingIconGlyphClasses } from './icon-glyph.variants'

export type { CompactLabelSize as ChipSize }

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
  size?: CompactLabelSize
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
  size: 'md' | 'lg'
  selected?: never
  onSelectedChange?: never
  selectionRole?: never
}

export type ChipProps = ChipSelectableProps | ChipRemovableProps

function ChipLeadingCheck({ size }: { size: CompactLabelSize }) {
  return <Check aria-hidden className={cn('shrink-0', chipLeadingIconGlyphClasses(size))} />
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
    selected && leadingIcon === undefined ? <ChipLeadingCheck size={size} /> : leadingIcon

  return (
    <button
      id={id}
      type="button"
      role={selectionRole}
      aria-checked={selected}
      disabled={disabled}
      className={resolveCompactLabelClassName({
        size,
        selected,
        interactive: true,
        filled: selected,
        className,
      })}
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
  size,
  onRemove,
  removeLabel,
  disabled,
  className,
}: ChipRemovableProps) {
  return (
    <span
      className={resolveCompactLabelClassName({
        size,
        appearance: 'soft',
        tone: 'neutral',
        filled: true,
        interactive: false,
        removable: true,
        className,
      })}
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
        <X aria-hidden />
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
