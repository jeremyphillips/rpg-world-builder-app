import {
  createSkillProficiencyInputSchema,
  type CreateSkillProficiencyInput,
  type SkillProficiency,
} from '@rpg/contracts'

import { finalizeContentInput, slugForInputParse } from '../../lib/forms/content-form-key-helpers'
import type { ContentFormInputCtx } from '../../lib/forms/content-form-registry'
import type { SkillProficiencyFormValues } from './skill-proficiency-form-fields'

export function skillProficiencyToFormValues(entity: SkillProficiency): SkillProficiencyFormValues {
  return {
    name: entity.name,
    slug: entity.slug,
    description: entity.description,
    ability: entity.ability,
    suggestedClasses: entity.suggestedClasses,
  }
}

export function buildSkillProficiencyCreateInput(
  values: SkillProficiencyFormValues,
  ctx?: ContentFormInputCtx<SkillProficiency>,
): CreateSkillProficiencyInput {
  const input = createSkillProficiencyInputSchema.parse({
    slug: slugForInputParse(values.name, ctx),
    name: values.name,
    description: values.description || undefined,
    ability: values.ability,
    suggestedClasses: values.suggestedClasses,
  })
  return finalizeContentInput(input, ctx) as CreateSkillProficiencyInput
}
