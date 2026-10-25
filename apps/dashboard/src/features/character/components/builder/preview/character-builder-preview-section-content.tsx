import type { ReactNode } from 'react'

import { cn, Panel, Text } from '@rpg/ui'

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
        {hint ? <Text variant="caption">{hint}</Text> : null}
        <Panel tone="transparent" density="comfortable" className="flex flex-col gap-3">
          {children}
        </Panel>
      </div>
    )
  }

  if (hint) {
    return (
      <div className={cn('flex flex-col gap-3', className)}>
        <Text variant="caption">{hint}</Text>
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
      <Text variant="label" className="text-foreground">
        {title}
      </Text>
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
  return <Text variant="caption">{children}</Text>
}
