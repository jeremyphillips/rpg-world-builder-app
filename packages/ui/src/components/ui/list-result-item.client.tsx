'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import {
  listResultItemClassificationVariants,
  listResultItemMainVariants,
  listResultItemMetadataVariants,
  listResultItemNameVariants,
  listResultItemShellVariants,
  listResultItemTrailingActionVariants,
} from './list-result.variants'

export interface ListResultItemIdentityProps {
  name: string
  classification?: string
  metadata?: React.ReactNode
}

export function ListResultItemIdentity({
  name,
  classification,
  metadata,
}: ListResultItemIdentityProps) {
  return (
    <div className="min-w-0 flex-1">
      <p className="text-sm">
        <span className={listResultItemNameVariants()}>{name}</span>
        {classification ? (
          <>
            <span className="text-muted-foreground"> · </span>
            <span className={listResultItemClassificationVariants()}>{classification}</span>
          </>
        ) : null}
      </p>
      {metadata ? <p className={listResultItemMetadataVariants()}>{metadata}</p> : null}
    </div>
  )
}

export interface ListResultItemProps extends Partial<ListResultItemIdentityProps> {
  /** Replaces the default identity block while keeping row chrome. */
  content?: React.ReactNode
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
      <ListResultItemIdentity name={name} classification={classification} metadata={metadata} />
      {endSlot ? <div className="shrink-0">{endSlot}</div> : null}
    </>
  )

  const shellClassName = listResultItemShellVariants({
    highlighted,
    selected,
    disabled,
    interactive,
  })
  const mainClassName = cn(listResultItemMainVariants(), className)

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
