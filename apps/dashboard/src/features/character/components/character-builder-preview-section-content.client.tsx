'use client'

import type { ReactNode } from 'react'

import { cn } from '@rpg/ui'

import {
  characterBuilderPreviewSectionHintClasses,
  characterBuilderPreviewSubsectionClasses,
  characterBuilderPreviewSubsectionHintClasses,
  characterBuilderPreviewSubsectionTitleClasses,
  characterBuilderPreviewSubsectionsGroupClasses,
} from './character-builder-preview-section-content.variants'

export type CharacterBuilderPreviewSectionLayout = 'default' | 'subsections'

export type CharacterBuilderPreviewSectionContentProps = {
  /**
   * `subsections` wraps children in a bordered, padded group — use for Proficiencies,
   * Equipment, and any section with labeled sub-blocks.
   */
  layout?: CharacterBuilderPreviewSectionLayout
  /** Section-level helper shown above grouped content at 12px. */
  hint?: ReactNode
  children: ReactNode
  className?: string
}

export function CharacterBuilderPreviewSectionContent({
  layout = 'default',
  hint,
  children,
  className,
}: CharacterBuilderPreviewSectionContentProps) {
  if (layout === 'subsections') {
    return (
      <div className={cn('flex flex-col gap-3', className)}>
        {hint ? <p className={characterBuilderPreviewSectionHintClasses}>{hint}</p> : null}
        <div className={characterBuilderPreviewSubsectionsGroupClasses}>{children}</div>
      </div>
    )
  }

  if (hint) {
    return (
      <div className={cn('flex flex-col gap-3', className)}>
        <p className={characterBuilderPreviewSectionHintClasses}>{hint}</p>
        {children}
      </div>
    )
  }

  return <>{children}</>
}

export type CharacterBuilderPreviewSubsectionProps = {
  title: string
  children: ReactNode
}

export function CharacterBuilderPreviewSubsection({
  title,
  children,
}: CharacterBuilderPreviewSubsectionProps) {
  return (
    <div className={characterBuilderPreviewSubsectionClasses}>
      <p className={characterBuilderPreviewSubsectionTitleClasses}>{title}</p>
      {children}
    </div>
  )
}

export type CharacterBuilderPreviewSubsectionHintProps = {
  children: ReactNode
}

export function CharacterBuilderPreviewSubsectionHint({
  children,
}: CharacterBuilderPreviewSubsectionHintProps) {
  return <p className={characterBuilderPreviewSubsectionHintClasses}>{children}</p>
}
