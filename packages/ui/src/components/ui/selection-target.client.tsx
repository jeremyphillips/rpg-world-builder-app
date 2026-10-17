'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { RadioGroupItem } from './radio-group.client'

export function SelectionTarget({
  children,
  className,
  htmlFor,
}: {
  children: React.ReactNode
  className?: string
  /** Associates the stretched hit area with the nested radio control. */
  htmlFor?: string
}): React.JSX.Element {
  const Comp = htmlFor ? 'label' : 'div'
  return (
    <Comp htmlFor={htmlFor} className={cn('ui-selection-target', className)}>
      {children}
    </Comp>
  )
}

export function SelectionTargetRaised({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}): React.JSX.Element {
  return <div className={cn('ui-selection-target__raised', className)}>{children}</div>
}

export type SelectionTargetRadioProps = {
  id?: string
  value: string
  disabled?: boolean
  'aria-labelledby'?: string
  'aria-label'?: string
  'aria-describedby'?: string
  /** Omitted: the standard ui-choice-control radio. A node renders the tile/icon indicator. */
  indicator?: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  className?: string
}

export function SelectionTargetRadio({
  id,
  value,
  disabled,
  indicator,
  onClick,
  className,
  ...aria
}: SelectionTargetRadioProps): React.JSX.Element {
  if (indicator) {
    return (
      <div className="ui-selection-target__control">
        <RadioGroupItem
          id={id}
          value={value}
          disabled={disabled}
          variant="tile"
          className={cn('border-0 bg-transparent p-0 shadow-none outline-none', className)}
          onClick={onClick}
          {...aria}
        >
          {indicator}
        </RadioGroupItem>
      </div>
    )
  }

  return (
    <div className="ui-selection-target__control">
      <RadioGroupItem
        id={id}
        value={value}
        disabled={disabled}
        className={className}
        onClick={onClick}
        {...aria}
      />
    </div>
  )
}
