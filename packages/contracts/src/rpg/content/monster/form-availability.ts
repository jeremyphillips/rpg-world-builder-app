import type { z } from 'zod'

import { addCustomRefinementIssue } from '../../../lib/add-custom-refinement-issue'
import type { CreatureFormsDraft } from '../creature/forms'
import {
  monsterActionSectionRowPath,
  monsterActionSectionRows,
  type MonsterActionSectionBody,
} from './action-section-access'
import { MONSTER_ACTION_SECTIONS } from './action-sections'

export const FORM_RESTRICTION_EMPTY_MESSAGE = 'No forms selected.'
export const FORM_RESTRICTION_UNRESOLVED_MESSAGE = 'Select an existing form.'
export const FORM_RESTRICTION_DUPLICATE_MESSAGE = 'Form ids must be unique.'
export const FORM_RESTRICTION_REQUIRES_FORMS_MESSAGE = 'Add forms before restricting this row.'

type FormAvailabilityBody = MonsterActionSectionBody & {
  forms?: CreatureFormsDraft
  traits?: readonly unknown[]
}

/** Present when the row stores `onlyInFormIds`, including an empty publish-invalid list. */
export function readMonsterRowFormRestrictionIds(row: unknown): readonly string[] | undefined {
  if (!row || typeof row !== 'object' || !('onlyInFormIds' in row)) return undefined
  const ids = (row as { onlyInFormIds?: unknown }).onlyInFormIds
  if (!Array.isArray(ids)) return undefined
  return ids.filter((id): id is string => typeof id === 'string')
}

/** Ids that may appear in `onlyInFormIds`; shared with {@link refineMonsterFormAvailability}. */
export function monsterFormRestrictionEligibleIds(forms: CreatureFormsDraft): readonly string[] {
  if (!Array.isArray(forms.definedForms) || !forms.trueForm) return []
  const ids = new Set(forms.definedForms.flatMap((form) => (form.id ? [form.id] : [])))
  if (forms.trueForm.kind === 'profile' && forms.profileFormId) ids.add(forms.profileFormId)
  return [...ids]
}

function eligibleFormIds(forms: CreatureFormsDraft): Set<string> {
  return new Set(monsterFormRestrictionEligibleIds(forms))
}

function refineRestriction(
  ids: readonly string[] | undefined,
  forms: CreatureFormsDraft | undefined,
  ctx: z.RefinementCtx,
  path: (string | number)[],
): void {
  if (!ids) return
  if (!forms) {
    addCustomRefinementIssue(ctx, FORM_RESTRICTION_REQUIRES_FORMS_MESSAGE, path)
    return
  }
  if (ids.length === 0) {
    addCustomRefinementIssue(ctx, FORM_RESTRICTION_EMPTY_MESSAGE, path)
    return
  }
  if (new Set(ids).size !== ids.length) {
    addCustomRefinementIssue(ctx, FORM_RESTRICTION_DUPLICATE_MESSAGE, path)
  }
  const eligible = eligibleFormIds(forms)
  if (ids.some((id) => !eligible.has(id))) {
    addCustomRefinementIssue(ctx, FORM_RESTRICTION_UNRESOLVED_MESSAGE, path)
  }
}

/** Publish rules for `onlyInFormIds`: present lists stay lists, including an empty draft. */
export function refineMonsterFormAvailability(
  body: FormAvailabilityBody,
  ctx: z.RefinementCtx,
  prefix: (string | number)[] = [],
): void {
  body.traits?.forEach((trait, index) => {
    refineRestriction(readMonsterRowFormRestrictionIds(trait), body.forms, ctx, [
      ...prefix,
      'traits',
      index,
      'onlyInFormIds',
    ])
  })
  for (const section of MONSTER_ACTION_SECTIONS) {
    monsterActionSectionRows(body, section).forEach((action, index) => {
      refineRestriction(readMonsterRowFormRestrictionIds(action), body.forms, ctx, [
        ...prefix,
        ...monsterActionSectionRowPath(section, index, 'onlyInFormIds'),
      ])
    })
  }
}
