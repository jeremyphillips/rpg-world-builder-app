import * as React from 'react'

import { Eyebrow } from '@rpg/ui'

import type { QuickNpcBuildCardModel } from '../../lib/quick-npc/quick-npc-build-card.lib'
import { useQuickNpcBuildCardExpandedAttribute } from '../../lib/quick-npc/quick-npc-build-card-expansion.lib'
import {
  BuildCardClassAttributeRow,
  BuildCardLevelAttributeRow,
  BuildCardRoleAttributeRow,
  BuildCardTemplateIdentity,
} from './quick-npc-build-card-parts'
import {
  quickNpcBuildCardAttributesShellClasses,
  quickNpcBuildCardSectionClasses,
  quickNpcBuildCardShellClasses,
} from './quick-npc-build-card.variants'

export type QuickNpcBuildCardProps = {
  model: QuickNpcBuildCardModel
  onClassChange: (classId: string) => void
  onLevelChange: (level: number) => void
  onRoleChange?: (npcTemplateId: string) => void
  className?: string
}

export function QuickNpcBuildCard({
  model,
  onClassChange,
  onLevelChange,
  onRoleChange,
  className,
}: QuickNpcBuildCardProps) {
  const baseId = React.useId()
  const [expanded, setExpanded] = useQuickNpcBuildCardExpandedAttribute({
    classProgressionApplicable: model.classProgressionApplicable,
    classId: model.classId,
    roleRowEnabled: model.roleRow != null,
    npcTemplateId: model.roleRow?.npcTemplateId ?? '',
  })

  const roleExpanded = model.roleRow != null && expanded === 'role'
  const classExpanded = model.classProgressionApplicable && expanded === 'class'
  const levelExpanded = expanded === 'level'

  const handleClassChange = (nextClassId: string) => {
    onClassChange(nextClassId)
    setExpanded(null)
  }

  return (
    <section className={className ?? quickNpcBuildCardSectionClasses}>
      <Eyebrow size="md">{model.sectionEyebrow}</Eyebrow>
      <article className={quickNpcBuildCardShellClasses}>
        {model.showTemplateIdentity && model.templateLabel ? (
          <BuildCardTemplateIdentity
            templateLabel={model.templateLabel}
            templateDescription={model.templateDescription}
          />
        ) : null}

        <div className={quickNpcBuildCardAttributesShellClasses}>
          {model.roleRow && onRoleChange ? (
            <BuildCardRoleAttributeRow
              baseId={baseId}
              roleRow={model.roleRow}
              expanded={roleExpanded}
              onToggle={() => setExpanded(roleExpanded ? null : 'role')}
              onRoleChange={(npcTemplateId) => {
                onRoleChange(npcTemplateId)
                setExpanded(null)
              }}
            />
          ) : null}

          <BuildCardLevelAttributeRow
            model={model}
            expanded={levelExpanded}
            onToggle={() => setExpanded(levelExpanded ? null : 'level')}
            onLevelChange={onLevelChange}
          />

          <BuildCardClassAttributeRow
            baseId={baseId}
            model={model}
            expanded={classExpanded}
            onToggle={() => {
              if (!model.classProgressionApplicable) return
              setExpanded(classExpanded ? null : 'class')
            }}
            onClassChange={handleClassChange}
          />
        </div>
      </article>
    </section>
  )
}
