import { z } from 'zod'

import { creatureSizesDraftSchema, creatureSizesSchema } from '../../vocab/creature-size'

export const FORM_NAME_REQUIRED_MESSAGE = 'Enter a form name.'
export const FORMS_REQUIRED_MESSAGE = 'Add a form or remove the forms configuration.'
export const FORM_TRUE_REQUIRED_MESSAGE = 'Select the true form.'
export const FORM_TRUE_MISSING_MESSAGE = 'Select an existing form as the true form.'
export const FORM_DESTINATION_REQUIRED_MESSAGE = 'Add a form other than the true form.'
export const FORM_TRUE_OVERRIDES_MESSAGE =
  'The true form uses base statistics. Remove its statistic overrides.'

type CreatureFormMode = 'draft' | 'published'

function definedForm(mode: CreatureFormMode) {
  const name = z.string(FORM_NAME_REQUIRED_MESSAGE).trim().min(1, FORM_NAME_REQUIRED_MESSAGE)
  return z.strictObject({
    id: z.string().min(1),
    name: mode === 'draft' ? name.optional() : name,
    overrides: formOverrides(mode).optional(),
    notes: z.string().trim().min(1).optional(),
  })
}

function formOverrides(mode: CreatureFormMode) {
  return z.strictObject({
    sizes: (mode === 'draft' ? creatureSizesDraftSchema : creatureSizesSchema).optional(),
  })
}

/** Creature form identity and authored statistic overrides shared by form-capable creatures. */
export function creatureFormsSchemaFor(mode: CreatureFormMode) {
  const forms =
    mode === 'draft'
      ? z.array(definedForm(mode)).default([])
      : z.array(definedForm(mode)).min(1, FORMS_REQUIRED_MESSAGE)
  const profileTrueForm = z.strictObject({
    kind: z.literal('profile'),
    name: z.string().trim().min(1).optional(),
  })
  const definedTrueForm = z.strictObject({
    kind: z.literal('defined'),
    formId:
      mode === 'draft'
        ? z.string().trim().min(1).optional()
        : z.string(FORM_TRUE_REQUIRED_MESSAGE).trim().min(1, FORM_TRUE_REQUIRED_MESSAGE),
  })
  return z.strictObject({
    profileFormId: z.string().min(1),
    trueForm: z.discriminatedUnion('kind', [profileTrueForm, definedTrueForm]),
    definedForms: forms,
  })
}

export const creatureFormsSchema = creatureFormsSchemaFor('published')
export const creatureFormsDraftSchema = creatureFormsSchemaFor('draft')

export type CreatureForms = z.infer<typeof creatureFormsSchema>
export type CreatureFormsDraft = z.infer<typeof creatureFormsDraftSchema>
export type CreatureDefinedForm = CreatureForms['definedForms'][number]
