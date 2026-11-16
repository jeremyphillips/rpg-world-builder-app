import { z } from 'zod'

import { creatureSizesDraftSchema, creatureSizesSchema } from '../../vocab/creature-size'

export const FORM_NAME_REQUIRED_MESSAGE = 'Name is required'
export const FORM_ALTERNATES_REQUIRED_MESSAGE = 'Add an alternate form or remove alternate forms'

type CreatureFormMode = 'draft' | 'published'

function formIdentity(mode: CreatureFormMode) {
  const name = z.string(FORM_NAME_REQUIRED_MESSAGE).trim().min(1, FORM_NAME_REQUIRED_MESSAGE)
  return {
    id: z.string().min(1),
    name: mode === 'draft' ? name.optional() : name,
    appearance: z.string().trim().min(1).optional(),
  }
}

function formOverrides(mode: CreatureFormMode) {
  return z.strictObject({
    sizes: (mode === 'draft' ? creatureSizesDraftSchema : creatureSizesSchema).optional(),
  })
}

/** Alternate-form mechanics shared by any creature. Sizes only until movement and speech land. */
export function creatureFormsSchemaFor(mode: CreatureFormMode) {
  const alternate = z.strictObject({
    ...formIdentity(mode),
    overrides: formOverrides(mode).default({}),
    notes: z.string().trim().min(1).optional(),
  })
  const alternates =
    mode === 'draft'
      ? z.array(alternate).default([])
      : z.array(alternate).min(1, FORM_ALTERNATES_REQUIRED_MESSAGE)
  return z.strictObject({
    trueForm: z.strictObject(formIdentity(mode)),
    alternates,
  })
}

export const creatureFormsSchema = creatureFormsSchemaFor('published')
export const creatureFormsDraftSchema = creatureFormsSchemaFor('draft')

export type CreatureForms = z.infer<typeof creatureFormsSchema>
export type CreatureFormsDraft = z.infer<typeof creatureFormsDraftSchema>
export type CreatureAlternateForm = CreatureForms['alternates'][number]
