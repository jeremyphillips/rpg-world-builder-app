import {
  formatMonsterShapeShift,
  joinNaturalList,
  monsterHasFormRestrictions,
  resolveCreatureFormsContext,
  type MonsterActionDraft,
} from '@rpg/contracts'

import { movementRowsToRecordForPreview } from '../../../../lib/forms/fields/content-movement-form-fields'
import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import { MONSTER_SHAPE_SHIFT_REQUIRES_ALTERNATE_FORM_NOTE } from '../../monster-form-labels'
import type { MonsterFormValues } from '../../monster-form-values'
import { findMonsterFormActionDraft } from './monster-action-draft-lookup'

const SHAPE_SHIFT_INCOMPLETE_FORMS_GUIDANCE = 'Select the true form to preview Shape-Shift.'

export type MonsterActionShapeShiftPreview = {
  destinationsProse: string
  rulesProse: string
}

function isShapeShiftDraft(
  action: MonsterActionDraft,
): action is Extract<MonsterActionDraft, { kind: 'shape-shift' }> {
  return action.kind === 'shape-shift'
}

/** Destinations list and shape-shift rules prose for the form preview slot. */
export function buildMonsterActionShapeShiftPreview(input: {
  values: MonsterFormValues
  ctx: ContentFormCtx
  actionId: string
}): MonsterActionShapeShiftPreview | null {
  if (!input.values.forms) return null

  const draft = findMonsterFormActionDraft(input.values, input.ctx, input.actionId)
  if (!draft || !isShapeShiftDraft(draft)) return null

  const context = resolveCreatureFormsContext(input.values.forms, input.values.name)
  if (context.status !== 'complete') {
    return {
      destinationsProse: '',
      rulesProse: SHAPE_SHIFT_INCOMPLETE_FORMS_GUIDANCE,
    }
  }
  if (context.alternateDestinations.length === 0) {
    return {
      destinationsProse: '',
      rulesProse: MONSTER_SHAPE_SHIFT_REQUIRES_ALTERNATE_FORM_NOTE,
    }
  }

  const destinationNames = context.alternateDestinations.map((form) => form.name || 'Untitled form')
  const baseMovement = movementRowsToRecordForPreview(input.values.movement ?? [])
  const rulesProse = formatMonsterShapeShift({
    monsterName: input.values.name,
    baseSizes: input.values.sizes ?? [],
    baseMovement,
    baseHover: input.values.hover,
    forms: input.values.forms,
    equipment: draft.equipment,
    prerequisite: draft.prerequisite,
    description: draft.description,
    hasShapeShift: true,
    hasFormRestrictions: monsterHasFormRestrictions(
      input.values as Parameters<typeof monsterHasFormRestrictions>[0],
    ),
  })

  return {
    destinationsProse: joinNaturalList(destinationNames),
    rulesProse,
  }
}
