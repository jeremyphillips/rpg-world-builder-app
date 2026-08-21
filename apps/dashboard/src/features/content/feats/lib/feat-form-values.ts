import {
  createFeatDraftInputSchema,
  createFeatInputSchema,
  MAX_CHARACTER_LEVEL,
  type ContentValidationIntent,
  type CreateFeatInput,
  type Feat,
} from '@rpg/contracts'

import { finalizeContentInput, slugForInputParse } from '../../lib/forms/registry/content-form-key-helpers'
import type { ContentFormInputCtx } from '../../lib/forms/registry/content-form-registry'
import { requirementEditorDefaultValue } from './requirement-editor-form-schema'
import {
  requirementEditorToExpression,
  requirementExpressionToEditor,
} from './requirement-editor-form-values'
import type { FeatFormValues } from './feat-form-fields'

export const featCreateDefaultValues: Partial<FeatFormValues> = {
  category: 'general',
  prerequisiteEditor: requirementEditorDefaultValue(),
  repeatableAllowed: false,
}

export function featToFormValues(entity: Feat): FeatFormValues {
  return {
    name: entity.name,
    slug: entity.slug,
    description: entity.description,
    category: entity.category,
    prerequisiteEditor: requirementExpressionToEditor(entity.prerequisite),
    repeatableAllowed: entity.repeatable.allowed,
    repeatableNotes: entity.repeatable.notes,
  }
}

export function buildFeatCreateInput(
  values: FeatFormValues,
  ctx?: ContentFormInputCtx<Feat>,
  validationIntent: ContentValidationIntent = 'publish',
): CreateFeatInput {
  const maxLevel = ctx?.campaignRules?.maxCharacterLevel ?? MAX_CHARACTER_LEVEL
  const prerequisite = requirementEditorToExpression(values.prerequisiteEditor, maxLevel)
  const repeatable = values.repeatableAllowed
    ? {
        allowed: true as const,
        notes: values.repeatableNotes?.trim() || undefined,
      }
    : { allowed: false as const }

  const schema = validationIntent === 'draft' ? createFeatDraftInputSchema : createFeatInputSchema

  const input = schema.parse({
    slug: slugForInputParse(values.name, ctx),
    name: values.name,
    description: values.description || undefined,
    ...(values.category !== undefined ? { category: values.category } : {}),
    prerequisite,
    repeatable,
  })
  return finalizeContentInput(input, ctx) as CreateFeatInput
}
