import { z } from 'zod'
import { skillSchema } from '@rpg/contracts'
import { type FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../lib/forms/content-form-registry'

const SKILL_CHOICE_CHOOSE_PATH = 'characterCreation.proficiencies.skills.choose' as const
const SKILL_CHOICE_FROM_PATH = 'characterCreation.proficiencies.skills.from' as const

/**
 * First-choice-only outlier: flat choose/from form fields map to
 * `characterCreation.proficiencies.skills.choices[0]` on save until multi-package
 * skill choice UI exists.
 */
export const characterCreationSkillChoiceFormSchema = z.object({
  choose: z.coerce.number().int().min(0),
  from: z.array(skillSchema),
})

export const characterCreationProficienciesFormSchema = z.object({
  skills: characterCreationSkillChoiceFormSchema,
})

export type CharacterCreationProficienciesForm = z.infer<
  typeof characterCreationProficienciesFormSchema
>

/** Inline choose count + skill chips for the first character-creation skill choice. */
export function characterCreationSkillChoiceFields(ctx: ContentFormCtx): FormItem[] {
  const skillOptions = ctx.options?.skills ?? []
  const skillCount = skillOptions.length

  return [
    {
      type: 'inlineSentence',
      name: SKILL_CHOICE_FROM_PATH,
      label: 'Skill proficiency choice',
      hideLabel: true,
      segments: [
        { kind: 'text', value: 'Character can choose', tone: 'label' },
        {
          kind: 'number',
          name: SKILL_CHOICE_CHOOSE_PATH,
          min: 0,
          ...(skillCount > 0 ? { max: skillCount } : {}),
        },
        { kind: 'text', value: 'Skill Proficiencies from:', tone: 'label' },
      ],
      below: {
        kind: 'chips',
        name: SKILL_CHOICE_FROM_PATH,
        options: skillOptions,
      },
    },
  ]
}

/** Proficiencies group on the Character creation tab (skill choices only in this pass). */
export function characterCreationProficienciesFields(ctx: ContentFormCtx): FormItem[] {
  return [
    {
      kind: 'group',
      legend: 'Proficiencies',
      fields: [
        {
          kind: 'group',
          legend: 'Skill Proficiencies',
          fields: characterCreationSkillChoiceFields(ctx),
        },
      ],
    },
  ]
}
