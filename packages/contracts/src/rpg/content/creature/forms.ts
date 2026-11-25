import { z } from 'zod'

import { addCustomRefinementIssue } from '../../../lib/add-custom-refinement-issue'
import { overlayDeleteIdRows } from '../lib/system-overlay/overlay-presets'
import { creatureSizesDraftSchema, creatureSizesSchema } from '../../vocab/creature-size'
import {
  movementSpeedsDraftSchema,
  movementSpeedsSchema,
  type MovementSpeeds,
} from '../../vocab/movement-mode'

export const FORM_NAME_REQUIRED_MESSAGE = 'Enter a form name.'
export const FORMS_REQUIRED_MESSAGE = 'Add a form or remove the forms configuration.'
export const FORM_TRUE_REQUIRED_MESSAGE = 'Select the true form.'
export const FORM_TRUE_MISSING_MESSAGE = 'Select an existing form as the true form.'
export const FORM_DESTINATION_REQUIRED_MESSAGE = 'Add a form other than the true form.'
export const FORM_TRUE_OVERRIDES_MESSAGE =
  'The true form uses base statistics. Remove its statistic overrides.'

export const FORM_MOVEMENT_HOVER_REQUIRES_FLY_MESSAGE = 'Hover requires a fly speed.'

type CreatureFormMode = 'draft' | 'published'

function refineMovementHoverRequiresFly(
  profile: { speeds: MovementSpeeds; hover?: true },
  ctx: z.RefinementCtx,
  path: (string | number)[] = [],
): void {
  if (profile.hover === true && profile.speeds.fly === undefined) {
    addCustomRefinementIssue(ctx, FORM_MOVEMENT_HOVER_REQUIRES_FLY_MESSAGE, [...path, 'hover'])
  }
}

function creatureMovementProfile(mode: CreatureFormMode) {
  const speeds = mode === 'draft' ? movementSpeedsDraftSchema : movementSpeedsSchema
  return z
    .strictObject({
      speeds,
      hover: z.literal(true).optional(),
    })
    .superRefine((profile, ctx) => refineMovementHoverRequiresFly(profile, ctx))
}

function formOverrides(mode: CreatureFormMode) {
  return z.strictObject({
    sizes: (mode === 'draft' ? creatureSizesDraftSchema : creatureSizesSchema).optional(),
    movement: creatureMovementProfile(mode).optional(),
    canSpeak: z.literal(false).optional(),
  })
}

function definedForm(mode: CreatureFormMode) {
  const name = z.string(FORM_NAME_REQUIRED_MESSAGE).trim().min(1, FORM_NAME_REQUIRED_MESSAGE)
  return z.strictObject({
    id: z.string().min(1),
    name: mode === 'draft' ? name.optional() : name,
    overrides: formOverrides(mode).optional(),
    notes: z.string().trim().min(1).optional(),
  })
}

export type CreatureFormMovementProfile = z.infer<ReturnType<typeof creatureMovementProfile>>
export type CreatureFormOverrides = z.infer<ReturnType<typeof formOverrides>>

/** Creature form identity and authored statistic overrides shared by form-capable creatures. */
export function creatureFormsSchemaFor(mode: CreatureFormMode) {
  const forms =
    mode === 'draft'
      ? overlayDeleteIdRows(definedForm(mode)).default([])
      : overlayDeleteIdRows(definedForm(mode)).min(1, FORMS_REQUIRED_MESSAGE)
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
