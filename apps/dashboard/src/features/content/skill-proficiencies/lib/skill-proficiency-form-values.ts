import {
  createSkillProficiencyDraftInputSchema,
  createSkillProficiencyInputSchema,
  type ContentValidationIntent,
  type CreateSkillProficiencyInput,
  type SkillProficiency,
} from '@rpg/contracts'

import { finalizeContentInput, slugForInputParse } from '../../lib/forms/content-form-key-helpers'
import type { ContentFormInputCtx } from '../../lib/forms/content-form-registry'
import type { SkillProficiencyFormValues } from './skill-proficiency-form-fields'

export const skillProficiencyCreateDefaultValues: Partial<SkillProficiencyFormValues> = {
  examples: [{ value: '' }],
}

export function skillProficiencyToFormValues(
  entity: SkillProficiency,
): Partial<SkillProficiencyFormValues> {
  return {
    name: entity.name,
    slug: entity.slug,
    description: entity.description,
    ...(entity.ability !== undefined ? { ability: entity.ability } : {}),
    examples: (entity.examples ?? []).map((value) => ({ value })),
  }
}

export function buildSkillProficiencyCreateInput(
  values: SkillProficiencyFormValues,
  ctx?: ContentFormInputCtx<SkillProficiency>,
  validationIntent: ContentValidationIntent = 'publish',
): CreateSkillProficiencyInput {
  const schema =
    validationIntent === 'draft'
      ? createSkillProficiencyDraftInputSchema
      : createSkillProficiencyInputSchema

  const examples = values.examples
    .map(({ value }) => value.trim())
    .filter((value) => value.length > 0)

  const input = schema.parse({
    slug: slugForInputParse(values.name, ctx),
    name: values.name,
    description: values.description || undefined,
    ...(values.ability !== undefined ? { ability: values.ability } : {}),
    examples,
  })
  return finalizeContentInput(input, ctx) as CreateSkillProficiencyInput
}
