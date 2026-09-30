import * as React from 'react'
import { CheckIcon } from 'lucide-react'

import {
  Badge,
  Eyebrow,
  NumberStepper,
  RadioCardField,
  SelectionSummaryChangeAction,
  Text,
} from '@rpg/ui'

import { spreadQuickNpcRadioCardFieldPresentation } from '../../lib/quick-npc/quick-npc-affinity-option-groups.lib'
import type { QuickNpcBuildCardModel } from '../../lib/quick-npc/quick-npc-build-card.lib'
import {
  QUICK_NPC_BUILD_CHOOSE_CLASS_LABEL,
  QUICK_NPC_BUILD_CLASS_LEVEL_ZERO_HELPER,
  QUICK_NPC_BUILD_CLASS_NOT_APPLICABLE_LABEL,
  QUICK_NPC_BUILD_RECOMMENDED_BADGE_LABEL,
  resolveQuickNpcBuildCardExpandActionLabel,
  type QuickNpcBuildCardExpandActionKind,
  type QuickNpcBuildCardRoleRow,
} from '../../lib/quick-npc/quick-npc-build-card.lib'
import {
  quickNpcBuildCardAttributeHeaderClasses,
  quickNpcBuildCardAttributeHelperClasses,
  quickNpcBuildCardAttributeRowClasses,
  quickNpcBuildCardAttributeValueClasses,
  quickNpcBuildCardDescriptionVariants,
  quickNpcBuildCardIdentityRowClasses,
  quickNpcBuildCardIdentityTitleClasses,
  quickNpcBuildCardLevelEditorClasses,
  quickNpcBuildCardLevelPromptClasses,
} from './quick-npc-build-card.variants'

type BuildAttributeRowProps = {
  eyebrow: string
  expandActionKind?: QuickNpcBuildCardExpandActionKind
  expanded?: boolean
  onAction?: () => void
  value: React.ReactNode
  helper?: string
  helperClassName?: string
  children?: React.ReactNode
}

export function BuildAttributeRow({
  eyebrow,
  expandActionKind,
  expanded: rowExpanded = false,
  onAction,
  value,
  helper,
  helperClassName,
  children,
}: BuildAttributeRowProps) {
  const editing = children !== undefined
  const actionLabel =
    expandActionKind != null
      ? resolveQuickNpcBuildCardExpandActionLabel(expandActionKind, rowExpanded)
      : undefined

  return (
    <div className={quickNpcBuildCardAttributeRowClasses}>
      <div className={quickNpcBuildCardAttributeHeaderClasses}>
        <Eyebrow size="sm">{eyebrow}</Eyebrow>
        {actionLabel != null && onAction != null ? (
          <SelectionSummaryChangeAction
            changeLabel={actionLabel}
            ariaLabel={actionLabel}
            onChange={onAction}
          />
        ) : null}
      </div>
      {editing ? (
        children
      ) : (
        <>
          <div className={quickNpcBuildCardAttributeValueClasses}>{value}</div>
          {helper ? (
            <Text className={helperClassName ?? quickNpcBuildCardAttributeHelperClasses}>
              {helper}
            </Text>
          ) : null}
        </>
      )}
    </div>
  )
}

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
    <BuildAttributeRow
      eyebrow="ROLE"
      expandActionKind="role"
      expanded={expanded}
      onAction={onToggle}
      value={roleRow.selectedRoleLabel}
      helper={expanded ? undefined : roleRow.roleProvenanceHelper}
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
    </BuildAttributeRow>
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
        <Badge appearance="soft" tone="neutral" size="sm" leadingIcon={<CheckIcon />}>
          {QUICK_NPC_BUILD_RECOMMENDED_BADGE_LABEL}
        </Badge>
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
  model: QuickNpcBuildCardModel
  expanded: boolean
  onToggle: () => void
  onClassChange: (classId: string) => void
}

export function BuildCardClassAttributeRow({
  baseId,
  model,
  expanded,
  onToggle,
  onClassChange,
}: BuildCardClassEditorProps) {
  if (!model.classProgressionApplicable) {
    return (
      <BuildAttributeRow
        eyebrow={model.classTermLabel.toUpperCase()}
        value={QUICK_NPC_BUILD_CLASS_NOT_APPLICABLE_LABEL}
        helper={QUICK_NPC_BUILD_CLASS_LEVEL_ZERO_HELPER}
        helperClassName={quickNpcBuildCardLevelPromptClasses}
      />
    )
  }

  const collapsedClassValue =
    model.classId === '' ? QUICK_NPC_BUILD_CHOOSE_CLASS_LABEL : (model.selectedClassLabel ?? '')

  return (
    <BuildAttributeRow
      eyebrow={model.classTermLabel.toUpperCase()}
      expandActionKind="class"
      expanded={expanded}
      onAction={onToggle}
      value={collapsedClassValue}
      helper={expanded ? undefined : model.classRecommendationHelper}
    >
      {expanded ? (
        <RadioCardField
          id={`${baseId}-class`}
          label={model.classTermLabel}
          labelVisibility="srOnly"
          density="compact"
          width="full"
          value={model.classId}
          onValueChange={onClassChange}
          {...spreadQuickNpcRadioCardFieldPresentation(model.classOptionPresentation)}
        />
      ) : undefined}
    </BuildAttributeRow>
  )
}

type BuildCardLevelAttributeRowProps = {
  model: QuickNpcBuildCardModel
  expanded: boolean
  onToggle: () => void
  onLevelChange: (level: number) => void
}

export function BuildCardLevelAttributeRow({
  model,
  expanded,
  onToggle,
  onLevelChange,
}: BuildCardLevelAttributeRowProps) {
  return (
    <BuildAttributeRow
      eyebrow="LEVEL"
      expandActionKind="level"
      expanded={expanded}
      onAction={onToggle}
      value={model.level}
      helper={expanded ? undefined : model.levelPrompt}
      helperClassName={quickNpcBuildCardLevelPromptClasses}
    >
      {expanded ? (
        <div className="flex flex-col gap-y-3">
          <div className={quickNpcBuildCardLevelEditorClasses}>
            <NumberStepper
              aria-label="Level"
              size="sm"
              bordered
              digits={2}
              min={model.levelConstraints.minLevel}
              max={model.levelConstraints.maxLevel}
              value={model.level}
              onChange={onLevelChange}
            />
          </div>
          {model.levelPrompt ? (
            <Text className={quickNpcBuildCardLevelPromptClasses}>{model.levelPrompt}</Text>
          ) : null}
        </div>
      ) : undefined}
    </BuildAttributeRow>
  )
}
