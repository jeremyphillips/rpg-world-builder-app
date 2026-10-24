import type { ReactNode } from 'react'

import { cn, Panel } from '@rpg/ui'

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
        {hint ? <p className="text-style-caption">{hint}</p> : null}
        <Panel tone="transparent" density="comfortable" className="flex flex-col gap-3">
          {children}
        </Panel>
      </div>
    )
  }

  if (hint) {
    return (
      <div className={cn('flex flex-col gap-3', className)}>
        <p className="text-style-caption">{hint}</p>
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
    <div className="flex flex-col gap-1">
      <p className="text-style-label text-foreground">{title}</p>
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
  return <p className="text-style-caption">{children}</p>
}
