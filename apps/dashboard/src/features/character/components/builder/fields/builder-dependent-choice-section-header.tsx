import { Heading, Text } from '@rpg/ui'

import type { DependentChoiceSectionCopy } from '../../../lib/builder/builder-dependent-choice.lib'

export type BuilderDependentChoiceSectionHeaderProps = {
  title: string
  headingId: string
  sectionCopy: DependentChoiceSectionCopy
  embedded: boolean
}

export function BuilderDependentChoiceSectionHeader({
  title,
  headingId,
  sectionCopy,
  embedded,
}: BuilderDependentChoiceSectionHeaderProps) {
  if (embedded) return null

  return (
    <div className="flex items-start justify-between gap-3 border-0">
      <Heading variant="subsection" as="h3" id={headingId}>
        {title}
      </Heading>
      {sectionCopy.statusText ? (
        <Text variant="muted" className="shrink-0 text-right">
          {sectionCopy.statusText}
        </Text>
      ) : null}
    </div>
  )
}
