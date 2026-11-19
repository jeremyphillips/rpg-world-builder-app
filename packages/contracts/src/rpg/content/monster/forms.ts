import { z } from 'zod'

import { addCustomRefinementIssue } from '../../../lib/add-custom-refinement-issue'
import {
  creatureFormsDraftSchema,
  creatureFormsSchema,
  FORM_DESTINATION_REQUIRED_MESSAGE,
  FORM_TRUE_MISSING_MESSAGE,
  FORM_TRUE_OVERRIDES_MESSAGE,
  FORM_TRUE_REQUIRED_MESSAGE,
  type CreatureFormsDraft,
} from '../creature/forms'

import { formDifferencesPresentationSchema } from '../../vocab/form-differences-presentation'

/**
 * Monster stat-block host for defined forms and transformation destinations.
 */
export const monsterFormsSchema = creatureFormsSchema.extend({
  differencesPresentation: formDifferencesPresentationSchema.optional(),
})
export const monsterFormsDraftSchema = creatureFormsDraftSchema.extend({
  differencesPresentation: formDifferencesPresentationSchema.optional(),
})

export type MonsterForms = z.infer<typeof monsterFormsSchema>

function collectDefinedFormIdentity(
  forms: CreatureFormsDraft,
  ctx: z.RefinementCtx,
  prefix: (string | number)[],
): Map<string, number[]> {
  const seenIds = new Set(forms.profileFormId ? [forms.profileFormId] : [])
  const nameIndexes = new Map<string, number[]>()
  forms.definedForms.forEach((form, index) => {
    const path = [...prefix, 'forms', 'definedForms', index]
    if (seenIds.has(form.id)) {
      addCustomRefinementIssue(ctx, 'Form ids must be unique.', [...path, 'id'])
    }
    seenIds.add(form.id)
    const name = form.name?.trim().toLowerCase()
    if (name) nameIndexes.set(name, [...(nameIndexes.get(name) ?? []), index])
  })
  return nameIndexes
}

function reportDuplicateFormNames(
  forms: CreatureFormsDraft,
  ctx: z.RefinementCtx,
  prefix: (string | number)[],
  nameIndexes: ReadonlyMap<string, number[]>,
  creatureName?: string,
): void {
  const profileName =
    forms.trueForm.kind === 'profile'
      ? (forms.trueForm.name?.trim() || creatureName?.trim())?.toLowerCase()
      : undefined
  for (const [name, indexes] of nameIndexes) {
    if (indexes.length < 2 && name !== profileName) continue
    for (const index of indexes) {
      addCustomRefinementIssue(ctx, 'Form names must be unique.', [
        ...prefix,
        'forms',
        'definedForms',
        index,
        'name',
      ])
    }
    if (name === profileName && forms.trueForm.kind === 'profile' && forms.trueForm.name) {
      addCustomRefinementIssue(ctx, 'Form names must be unique.', [
        ...prefix,
        'forms',
        'trueForm',
        'name',
      ])
    }
  }
}

function reportPublishedFormIdentityIssues(
  forms: CreatureFormsDraft,
  ctx: z.RefinementCtx,
  prefix: (string | number)[],
): void {
  if (forms.trueForm.kind === 'profile') {
    if (forms.definedForms.length === 0) {
      addCustomRefinementIssue(ctx, FORM_DESTINATION_REQUIRED_MESSAGE, [
        ...prefix,
        'forms',
        'definedForms',
      ])
    }
    return
  }
  if (!forms.trueForm.formId) {
    addCustomRefinementIssue(ctx, FORM_TRUE_REQUIRED_MESSAGE, [
      ...prefix,
      'forms',
      'trueForm',
      'formId',
    ])
    return
  }
  const trueFormId = forms.trueForm.formId
  const trueForm = forms.definedForms.find((form) => form.id === trueFormId)
  if (!trueForm) {
    addCustomRefinementIssue(ctx, FORM_TRUE_MISSING_MESSAGE, [
      ...prefix,
      'forms',
      'trueForm',
      'formId',
    ])
    return
  }
  if (trueForm.overrides && Object.keys(trueForm.overrides).length > 0) {
    addCustomRefinementIssue(ctx, FORM_TRUE_OVERRIDES_MESSAGE, [
      ...prefix,
      'forms',
      'trueForm',
      'formId',
    ])
  }
  if (forms.definedForms.every((form) => form.id === trueForm.id)) {
    addCustomRefinementIssue(ctx, FORM_DESTINATION_REQUIRED_MESSAGE, [
      ...prefix,
      'forms',
      'definedForms',
    ])
  }
}

export function refineMonsterFormIdentity(
  forms: CreatureFormsDraft,
  ctx: z.RefinementCtx,
  prefix: (string | number)[] = [],
  options: { published?: boolean; creatureName?: string } = {},
): void {
  const { published = false, creatureName } = options
  const nameIndexes = collectDefinedFormIdentity(forms, ctx, prefix)
  reportDuplicateFormNames(forms, ctx, prefix, nameIndexes, creatureName)
  if (!published) return
  reportPublishedFormIdentityIssues(forms, ctx, prefix)
}
