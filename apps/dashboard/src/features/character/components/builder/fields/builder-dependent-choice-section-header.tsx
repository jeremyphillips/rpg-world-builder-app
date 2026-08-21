import { Heading, Text, cn } from '@rpg/ui'

import type { DependentChoiceSectionCopy } from '../../../lib/builder/builder-dependent-choice.lib'
import {
  builderDependentChoiceSectionHeaderClasses,
  builderDependentChoiceSectionPanelHeadingClasses,
  builderDependentChoiceSectionPanelStatusClasses,
} from './builder-dependent-choice-section.variants'

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
  return (
    <div className={builderDependentChoiceSectionHeaderClasses}>
      {embedded ? (
        <h3 id={headingId} className={builderDependentChoiceSectionPanelHeadingClasses}>
          {title}
        </h3>
      ) : (
        <Heading variant="subsection" as="h3" id={headingId}>
          {title}
        </Heading>
      )}
      <Text
        variant="muted"
        className={cn(
          'shrink-0 text-right',
          embedded ? builderDependentChoiceSectionPanelStatusClasses : undefined,
        )}
      >
        {sectionCopy.statusText}
      </Text>
    </div>
  )
}
