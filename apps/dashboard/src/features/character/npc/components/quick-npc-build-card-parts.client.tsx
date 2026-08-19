'use client'

import * as React from 'react'
import { CheckIcon } from 'lucide-react'

import { Badge, Button, Eyebrow, NumberStepper, RadioGroup, RadioGroupItem, Text } from '@rpg/ui'

import type { QuickNpcBuildCardModel } from '../lib/quick-npc-build-card.lib'
import {
  QUICK_NPC_BUILD_CHANGE_CLASS_LABEL,
  QUICK_NPC_BUILD_CHANGE_LEVEL_LABEL,
  QUICK_NPC_BUILD_CHOOSE_CLASS_LABEL,
  QUICK_NPC_BUILD_CLASS_LEVEL_ZERO_HELPER,
  QUICK_NPC_BUILD_CLASS_NOT_APPLICABLE_LABEL,
  QUICK_NPC_BUILD_DONE_LABEL,
  QUICK_NPC_BUILD_RECOMMENDED_BADGE_LABEL,
} from '../lib/quick-npc-build-card.lib'
import {
  quickNpcBuildCardActionLinkClasses,
  quickNpcBuildCardAttributeHeaderClasses,
  quickNpcBuildCardAttributeHelperClasses,
  quickNpcBuildCardAttributeRowClasses,
  quickNpcBuildCardAttributeRowDividerClasses,
  quickNpcBuildCardAttributeValueClasses,
  quickNpcBuildCardClassGroupClasses,
  quickNpcBuildCardClassOptionRowClasses,
  quickNpcBuildCardClassOptionLabelClasses,
  quickNpcBuildCardClassOptionsClasses,
  quickNpcBuildCardDescriptionVariants,
  quickNpcBuildCardIdentityRowClasses,
  quickNpcBuildCardIdentityTitleClasses,
  quickNpcBuildCardLevelEditorClasses,
  quickNpcBuildCardLevelPromptClasses,
} from './quick-npc-build-card.variants'

type BuildAttributeRowProps = {
  eyebrow: string
  actionLabel?: string
  onAction?: () => void
  value: React.ReactNode
  helper?: string
  helperClassName?: string
  children?: React.ReactNode
  showDivider?: boolean
}

export function BuildAttributeRow({
  eyebrow,
  actionLabel,
  onAction,
  value,
  helper,
  helperClassName,
  children,
  showDivider,
}: BuildAttributeRowProps) {
  const expanded = children !== undefined

  return (
    <div
      className={
        showDivider
          ? `${quickNpcBuildCardAttributeRowClasses} ${quickNpcBuildCardAttributeRowDividerClasses}`
          : quickNpcBuildCardAttributeRowClasses
      }
    >
      <div className={quickNpcBuildCardAttributeHeaderClasses}>
        <Eyebrow size="sm">{eyebrow}</Eyebrow>
        {actionLabel != null && onAction != null ? (
          <Button
            type="button"
            variant="link"
            size="sm"
            className={quickNpcBuildCardActionLinkClasses}
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        ) : null}
      </div>
      {expanded ? (
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
        showDivider={false}
      />
    )
  }

  const collapsedClassValue =
    model.classId === '' ? QUICK_NPC_BUILD_CHOOSE_CLASS_LABEL : (model.selectedClassLabel ?? '')
  const classGroups = model.classOptionGroups.optionGroups
  const flatClassOptions = model.classOptionGroups.options

  const handleClassChange = (nextClassId: string) => {
    onClassChange(nextClassId)
  }

  return (
    <BuildAttributeRow
      eyebrow={model.classTermLabel.toUpperCase()}
      actionLabel={QUICK_NPC_BUILD_CHANGE_CLASS_LABEL}
      onAction={onToggle}
      value={collapsedClassValue}
      helper={expanded ? undefined : model.classRecommendationHelper}
      showDivider={false}
    >
      {expanded ? (
        <RadioGroup
          className="flex flex-col gap-4"
          aria-label={model.classTermLabel}
          value={model.classId}
          onValueChange={handleClassChange}
        >
          {classGroups ? (
            classGroups.map((group) => (
              <div key={group.id} className={quickNpcBuildCardClassGroupClasses}>
                <Eyebrow size="xs">{group.eyebrow}</Eyebrow>
                <div className={quickNpcBuildCardClassOptionsClasses}>
                  {group.options.map((option) => {
                    const optionId = `${baseId}-${group.id}-${option.value}`
                    return (
                      <div key={option.value} className={quickNpcBuildCardClassOptionRowClasses}>
                        <RadioGroupItem
                          id={optionId}
                          value={option.value}
                          disabled={option.disabled}
                        />
                        <label
                          htmlFor={optionId}
                          className={quickNpcBuildCardClassOptionLabelClasses}
                        >
                          {option.label}
                        </label>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className={quickNpcBuildCardClassOptionsClasses}>
              {flatClassOptions.map((option) => {
                const optionId = `${baseId}-${option.value}`
                return (
                  <div key={option.value} className={quickNpcBuildCardClassOptionRowClasses}>
                    <RadioGroupItem id={optionId} value={option.value} disabled={option.disabled} />
                    <label htmlFor={optionId} className={quickNpcBuildCardClassOptionLabelClasses}>
                      {option.label}
                    </label>
                  </div>
                )
              })}
            </div>
          )}
        </RadioGroup>
      ) : undefined}
    </BuildAttributeRow>
  )
}

type BuildCardLevelAttributeRowProps = {
  model: QuickNpcBuildCardModel
  expanded: boolean
  onToggle: () => void
  onLevelChange: (level: number) => void
  showDivider: boolean
}

export function BuildCardLevelAttributeRow({
  model,
  expanded,
  onToggle,
  onLevelChange,
  showDivider,
}: BuildCardLevelAttributeRowProps) {
  return (
    <BuildAttributeRow
      eyebrow="LEVEL"
      actionLabel={expanded ? QUICK_NPC_BUILD_DONE_LABEL : QUICK_NPC_BUILD_CHANGE_LEVEL_LABEL}
      onAction={onToggle}
      value={model.level}
      helper={expanded ? undefined : model.levelPrompt}
      helperClassName={quickNpcBuildCardLevelPromptClasses}
      showDivider={showDivider}
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
