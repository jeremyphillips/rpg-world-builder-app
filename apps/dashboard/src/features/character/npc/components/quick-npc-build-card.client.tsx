'use client'

import * as React from 'react'

import { Eyebrow } from '@rpg/ui'

import type { QuickNpcBuildCardModel } from '../lib/quick-npc-build-card.lib'
import { useQuickNpcBuildCardExpandedAttribute } from '../lib/quick-npc-build-card-expansion.lib'
import {
  BuildCardClassAttributeRow,
  BuildCardLevelAttributeRow,
  BuildCardTemplateIdentity,
} from './quick-npc-build-card-parts.client'
import {
  quickNpcBuildCardAttributesShellClasses,
  quickNpcBuildCardSectionClasses,
  quickNpcBuildCardShellClasses,
} from './quick-npc-build-card.variants'

export type QuickNpcBuildCardProps = {
  model: QuickNpcBuildCardModel
  onClassChange: (classId: string) => void
  onLevelChange: (level: number) => void
  className?: string
}

export function QuickNpcBuildCard({
  model,
  onClassChange,
  onLevelChange,
  className,
}: QuickNpcBuildCardProps) {
  const baseId = React.useId()
  const [expanded, setExpanded] = useQuickNpcBuildCardExpandedAttribute({
    classProgressionApplicable: model.classProgressionApplicable,
    classId: model.classId,
  })

  const classExpanded = expanded === 'class'
  const levelExpanded = expanded === 'level'

  const handleClassChange = (nextClassId: string) => {
    onClassChange(nextClassId)
    setExpanded(null)
  }

  return (
    <section className={className ?? quickNpcBuildCardSectionClasses} data-field-align>
      <Eyebrow size="sm">{model.sectionEyebrow}</Eyebrow>
      <article className={quickNpcBuildCardShellClasses}>
        {model.templateLabel ? (
          <BuildCardTemplateIdentity
            templateLabel={model.templateLabel}
            templateDescription={model.templateDescription}
          />
        ) : null}

        <div className={quickNpcBuildCardAttributesShellClasses}>
          {model.classProgressionApplicable ? (
            <BuildCardClassAttributeRow
              baseId={baseId}
              model={model}
              expanded={classExpanded}
              onToggle={() => setExpanded(classExpanded ? null : 'class')}
              onClassChange={handleClassChange}
            />
          ) : null}

          <BuildCardLevelAttributeRow
            model={model}
            expanded={levelExpanded}
            onToggle={() => setExpanded(levelExpanded ? null : 'level')}
            onLevelChange={onLevelChange}
            showDivider={model.classProgressionApplicable}
          />
        </div>
      </article>
    </section>
  )
}
