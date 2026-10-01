'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { IdentityRow, type IdentityRowSize } from './identity-row.client'
import {
  listResultItemMainVariants,
  listResultItemShellVariants,
  listResultItemTrailingActionVariants,
} from './list-result.variants'

export type ListResultItemProps = {
  name?: string
  classification?: string
  metadata?: React.ReactNode
  /** Replaces the default identity block while keeping row chrome. */
  content?: React.ReactNode
  size?: IdentityRowSize
  /** Keyboard / pointer highlight — independent of selected. */
  highlighted?: boolean
  /** Persisted selection (e.g. combobox value) — independent of highlighted. */
  selected?: boolean
  disabled?: boolean
  /** When false, suppresses the default row-hover wash (e.g. static summaries). */
  interactive?: boolean
  startSlot?: React.ReactNode
  /** Decorative trailing chrome only — must not contain interactive controls. */
  endSlot?: React.ReactNode
  /** Interactive trailing control rendered as a sibling outside the main hit area. */
  trailingAction?: React.ReactNode
  className?: string
  /** Host supplies the interactive root; identity is injected as its first children. */
  asChild?: boolean
  children?: React.ReactElement
}

export function ListResultItem({
  name = '',
  classification,
  metadata,
  content,
  size = 'md',
  highlighted = false,
  selected = false,
  disabled = false,
  interactive = true,
  startSlot,
  endSlot,
  trailingAction,
  className,
  asChild = false,
  children,
}: ListResultItemProps) {
  const identity = content ?? (
    <>
      {startSlot ? <div className="shrink-0">{startSlot}</div> : null}
      <IdentityRow
        heading={name}
        classification={classification}
        supporting={metadata}
        size={size}
      />
      {endSlot ? <div className="shrink-0">{endSlot}</div> : null}
    </>
  )

  const shellClassName = listResultItemShellVariants({
    highlighted,
    selected,
    disabled,
    interactive,
  })
  const mainClassName = cn(listResultItemMainVariants({ interactive, size }), className)

  const main = asChild ? (
    React.isValidElement<{ className?: string; disabled?: boolean; children?: React.ReactNode }>(
      children,
    ) ? (
      React.cloneElement(children, {
        className: cn(mainClassName, children.props.className),
        disabled: disabled || children.props.disabled,
        children: (
          <>
            {identity}
            {children.props.children}
          </>
        ),
      })
    ) : (
      children
    )
  ) : (
    <div className={mainClassName}>{identity}</div>
  )

  return (
    <div className={shellClassName}>
      {main}
      {trailingAction ? (
        <div className={listResultItemTrailingActionVariants()}>{trailingAction}</div>
      ) : null}
    </div>
  )
}
