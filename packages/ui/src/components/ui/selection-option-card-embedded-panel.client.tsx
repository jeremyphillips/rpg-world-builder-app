'use client'

import type { ElementType, ReactNode } from 'react'

import { cn } from '../../lib/utils'
import {
  UI_OPTION_CARD_EMBEDDED_PANEL_CLASS_NAME,
  UI_OPTION_CARD_EMBEDDED_PANEL_HEADER_CLASS,
} from './selection-option-card.lib'

const OPTION_CARD_SUPPORTING_CLASS = 'ui-copy-supporting text-muted-foreground'

export type SelectionOptionCardEmbeddedPanelProps = {
  children: ReactNode
  className?: string
}

export function SelectionOptionCardEmbeddedPanel({
  children,
  className,
}: SelectionOptionCardEmbeddedPanelProps) {
  return <div className={cn(UI_OPTION_CARD_EMBEDDED_PANEL_CLASS_NAME, className)}>{children}</div>
}

export type SelectionOptionCardEmbeddedPanelHeaderProps = {
  title: string
  titleAs?: ElementType
  titleId?: string
  description?: ReactNode
  endSlot?: ReactNode
  className?: string
}

export function SelectionOptionCardEmbeddedPanelHeader({
  title,
  titleAs: TitleTag = 'h4',
  titleId,
  description,
  endSlot,
  className,
}: SelectionOptionCardEmbeddedPanelHeaderProps) {
  return (
    <div className={cn(UI_OPTION_CARD_EMBEDDED_PANEL_HEADER_CLASS, className)}>
      <div className="ui-option-card-embedded-panel__header-row">
        <TitleTag id={titleId} className="ui-copy-title">
          {title}
        </TitleTag>
        {endSlot}
      </div>
      {description ? <p className={OPTION_CARD_SUPPORTING_CLASS}>{description}</p> : null}
    </div>
  )
}

export type SelectionOptionCardEmbeddedPanelListProps = {
  children: ReactNode
  className?: string
}

export function SelectionOptionCardEmbeddedPanelList({
  children,
  className,
}: SelectionOptionCardEmbeddedPanelListProps) {
  return <ul className={cn('ui-option-card-embedded-panel__list', className)}>{children}</ul>
}

export type SelectionOptionCardEmbeddedPanelRowProps = {
  label: ReactNode
  children: ReactNode
  className?: string
}

export function SelectionOptionCardEmbeddedPanelRow({
  label,
  children,
  className,
}: SelectionOptionCardEmbeddedPanelRowProps) {
  return (
    <li className={cn('ui-option-card-embedded-panel__row', className)}>
      <span className="ui-option-card-embedded-panel__row-label ui-copy-supporting">{label}</span>
      <span className="ui-option-card-embedded-panel__row-controls">{children}</span>
    </li>
  )
}

export type SelectionOptionCardEmbeddedPanelRowStatusProps = {
  children: ReactNode
  className?: string
}

export function SelectionOptionCardEmbeddedPanelRowStatus({
  children,
  className,
}: SelectionOptionCardEmbeddedPanelRowStatusProps) {
  return (
    <span className={cn('text-control-action-xs text-muted-foreground', className)}>
      {children}
    </span>
  )
}
