import {
  ABILITY_SCORE_MAX,
  ABILITY_SCORE_MIN,
  campaignLevelSchema,
  formatRequirementExpression,
  MAX_CHARACTER_LEVEL,
} from '@rpg/contracts'
import type { RefinementCtx } from 'zod'

import {
  type PrerequisiteEditorValue,
  type RequirementLeafForm,
} from './requirement-editor-form-schema'
import {
  isRequirementLeafForm,
  requirementEditorToPreviewExpression,
} from './requirement-editor-form-values'

function addCustomIssue(ctx: RefinementCtx, path: (string | number)[], message: string): void {
  ctx.addIssue({ code: 'custom', message, path })
}

function validateLeaf(
  leaf: RequirementLeafForm,
  groupIndex: number,
  leafIndex: number,
  ctx: RefinementCtx,
  maxLevel: number = MAX_CHARACTER_LEVEL,
): void {
  const path = ['prerequisiteEditor', 'groups', groupIndex, 'requirements', leafIndex]

  if (!isRequirementLeafForm(leaf)) {
    addCustomIssue(ctx, [...path, 'type'], 'Condition type is required')
    return
  }

  switch (leaf.type) {
    case 'minLevel':
      if (!campaignLevelSchema(maxLevel).safeParse(leaf.level).success) {
        addCustomIssue(ctx, [...path, 'level'], 'Minimum character level is required')
      }
      return
    case 'abilityMinimum':
      if (leaf.minimum < ABILITY_SCORE_MIN || leaf.minimum > ABILITY_SCORE_MAX) {
        addCustomIssue(
          ctx,
          [...path, 'minimum'],
          `Minimum score must be between ${ABILITY_SCORE_MIN} and ${ABILITY_SCORE_MAX}`,
        )
      }
      return
    case 'spellcasting':
      return
  }
}

/** Zod superRefine hook for prerequisite editor groups and leaf rows. */
export function refineRequirementEditor(
  value: PrerequisiteEditorValue,
  ctx: RefinementCtx,
  maxLevel: number = MAX_CHARACTER_LEVEL,
): void {
  value.groups.forEach((group, groupIndex) => {
    if (group.requirements.length === 0) {
      addCustomIssue(
        ctx,
        ['prerequisiteEditor', 'groups', groupIndex, 'requirements'],
        'Add at least one requirement',
      )
    }

    group.requirements.forEach((leaf, leafIndex) => {
      validateLeaf(leaf, groupIndex, leafIndex, ctx, maxLevel)
    })
  })
}

/** Player-facing preview for the requirement editor. */
export function formatRequirementEditorPreview(
  value: PrerequisiteEditorValue | undefined,
  maxLevel: number = MAX_CHARACTER_LEVEL,
): string {
  const expression = requirementEditorToPreviewExpression(value, maxLevel)
  if (!expression) {
    return 'No prerequisites'
  }
  return `Requires ${formatRequirementExpression(expression)}`
}
