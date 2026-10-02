import { NumberStepper, RadioCardField, Text } from '@rpg/ui'

import { SetupAttributeRow } from '@/lib/create-setup/setup-attribute-row'

import { spreadQuickNpcRadioCardFieldPresentation } from '../../lib/quick-npc/quick-npc-affinity-option-groups.lib'
import type {
  QuickNpcBuildCardClassRow,
  QuickNpcBuildCardLevelRow,
  QuickNpcBuildCardRoleRow,
} from '../../lib/quick-npc/quick-npc-build-card.lib'
import {
  QUICK_NPC_BUILD_CHOOSE_CLASS_LABEL,
  QUICK_NPC_BUILD_CLASS_NOT_APPLICABLE_LABEL,
  resolveQuickNpcBuildCardExpandActionLabel,
} from '../../lib/quick-npc/quick-npc-build-card.lib'
import {
  quickNpcBuildCardDescriptionVariants,
  quickNpcBuildCardIdentityRowClasses,
  quickNpcBuildCardIdentityTitleClasses,
  quickNpcBuildCardLevelEditorClasses,
} from './quick-npc-build-card.variants'

type BuildCardRoleAttributeRowProps = {
  baseId: string
  roleRow: QuickNpcBuildCardRoleRow
  expanded: boolean
  onToggle: () => void
  onRoleChange: (npcTemplateId: string) => void
}

export function BuildCardRoleAttributeRow({
  baseId,
  roleRow,
  expanded,
  onToggle,
  onRoleChange,
}: BuildCardRoleAttributeRowProps) {
  return (
    <SetupAttributeRow
      eyebrow="ROLE"
      changeLabel={resolveQuickNpcBuildCardExpandActionLabel('role', expanded)}
      onChange={onToggle}
      value={roleRow.selectedRoleLabel}
      helper={expanded ? undefined : roleRow.helper}
    >
      {expanded ? (
        <RadioCardField
          id={`${baseId}-role`}
          label="Role"
          labelVisibility="srOnly"
          density="compact"
          width="full"
          value={roleRow.npcTemplateId}
          onValueChange={onRoleChange}
          {...spreadQuickNpcRadioCardFieldPresentation(roleRow.roleOptionPresentation)}
        />
      ) : undefined}
    </SetupAttributeRow>
  )
}

export function BuildCardTemplateIdentity({
  templateLabel,
  templateDescription,
}: {
  templateLabel: string
  templateDescription?: string
}) {
  return (
    <div className="flex flex-col gap-y-2">
      <div className={quickNpcBuildCardIdentityRowClasses}>
        <Text as="h3" className={quickNpcBuildCardIdentityTitleClasses}>
          {templateLabel}
        </Text>
      </div>
      {templateDescription ? (
        <Text as="p" className={quickNpcBuildCardDescriptionVariants()}>
          {templateDescription}
        </Text>
      ) : null}
    </div>
  )
}

type BuildCardClassEditorProps = {
  baseId: string
  classRow: QuickNpcBuildCardClassRow
  expanded: boolean
  onToggle: () => void
  onClassChange: (classId: string) => void
}

export function BuildCardClassAttributeRow({
  baseId,
  classRow,
  expanded,
  onToggle,
  onClassChange,
}: BuildCardClassEditorProps) {
  if (!classRow.classProgressionApplicable) {
    return (
      <SetupAttributeRow
        eyebrow={classRow.termLabel.toUpperCase()}
        value={QUICK_NPC_BUILD_CLASS_NOT_APPLICABLE_LABEL}
        helper={classRow.helper}
      />
    )
  }

  const collapsedClassValue =
    classRow.classId === ''
      ? QUICK_NPC_BUILD_CHOOSE_CLASS_LABEL
      : (classRow.selectedClassLabel ?? '')

  return (
    <SetupAttributeRow
      eyebrow={classRow.termLabel.toUpperCase()}
      changeLabel={resolveQuickNpcBuildCardExpandActionLabel('class', expanded)}
      onChange={onToggle}
      value={collapsedClassValue}
      helper={expanded ? undefined : classRow.helper}
    >
      {expanded ? (
        <RadioCardField
          id={`${baseId}-class`}
          label={classRow.termLabel}
          labelVisibility="srOnly"
          density="compact"
          width="full"
          value={classRow.classId}
          onValueChange={onClassChange}
          {...spreadQuickNpcRadioCardFieldPresentation(classRow.classOptionPresentation)}
        />
      ) : undefined}
    </SetupAttributeRow>
  )
}

type BuildCardLevelAttributeRowProps = {
  levelRow: QuickNpcBuildCardLevelRow
  onLevelChange: (level: number) => void
}

export function BuildCardLevelAttributeRow({
  levelRow,
  onLevelChange,
}: BuildCardLevelAttributeRowProps) {
  return (
    <SetupAttributeRow eyebrow="LEVEL" showHelperWhileEditing helper={levelRow.helper}>
      <div className={quickNpcBuildCardLevelEditorClasses}>
        <NumberStepper
          aria-label="Level"
          bordered
          digits={2}
          min={levelRow.levelConstraints.minLevel}
          max={levelRow.levelConstraints.maxLevel}
          value={levelRow.level}
          onChange={onLevelChange}
        />
      </div>
    </SetupAttributeRow>
  )
}
