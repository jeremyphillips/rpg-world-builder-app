'use client'

import type { ElementType, ReactNode } from 'react'

import { cn } from '../../lib/utils'
import {
  optionCardDescriptionVariants,
  optionCardEmbeddedPanelContentClasses,
  optionCardEmbeddedPanelHeaderClasses,
  optionCardEmbeddedPanelHeaderRowClasses,
  optionCardEmbeddedPanelListClasses,
  optionCardEmbeddedPanelRowClasses,
  optionCardEmbeddedPanelRowControlsClasses,
  optionCardEmbeddedPanelRowLabelClasses,
  optionCardEmbeddedPanelRowStatusClasses,
  optionCardTitleVariants,
} from './selection-option-card.variants'

export type SelectionOptionCardEmbeddedPanelProps = {
  children: ReactNode
  className?: string
}

export function SelectionOptionCardEmbeddedPanel({
  children,
  className,
}: SelectionOptionCardEmbeddedPanelProps) {
  return <div className={cn(optionCardEmbeddedPanelContentClasses, className)}>{children}</div>
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
    <div className={cn(optionCardEmbeddedPanelHeaderClasses, className)}>
      <div className={optionCardEmbeddedPanelHeaderRowClasses}>
        <TitleTag id={titleId} className={optionCardTitleVariants({ density: 'compact' })}>
          {title}
        </TitleTag>
        {endSlot}
      </div>
      {description ? (
        <p className={optionCardDescriptionVariants({ density: 'compact' })}>{description}</p>
      ) : null}
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
  return <ul className={cn(optionCardEmbeddedPanelListClasses, className)}>{children}</ul>
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
    <li className={cn(optionCardEmbeddedPanelRowClasses, className)}>
      <span className={optionCardEmbeddedPanelRowLabelClasses}>{label}</span>
      <span className={optionCardEmbeddedPanelRowControlsClasses}>{children}</span>
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
  return <span className={cn(optionCardEmbeddedPanelRowStatusClasses, className)}>{children}</span>
}
