import { z } from 'zod'
import { skillSchema } from '@rpg/contracts'
import { type FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../lib/forms/content-form-registry'
import {
  CHARACTER_CREATION_TOOL_POOL_FIELD_NAMES,
  TOOL_PROFICIENCY_POOL_SOURCES,
  toolProficiencyPoolFormFields,
} from '../../../lib/forms/tool-proficiency-pool-form-fields'
import {
  refineToolProficiencyPoolFormRow,
  type ToolProficiencyPoolFormRow,
} from '../../../lib/forms/tool-proficiency-pool-form-validation'
import {
  CHARACTER_CREATION_TOOL_CHOICE_LABEL_PATH,
  TOOL_PROFICIENCY_CHOICE_LABEL_FIELD,
} from './class-character-creation-link-labels'

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

/**
 * First-choice-only outlier: flat pool form fields map to
 * `characterCreation.proficiencies.tools.choices[0]` on save until multi-package
 * tool choice UI exists.
 */
export const characterCreationToolChoiceFormSchema = z
  .object({
    label: z.string().optional(),
    choose: z.coerce.number().int().min(0),
    poolSource: z.enum(TOOL_PROFICIENCY_POOL_SOURCES).default('filtered'),
    poolToolSlugs: z.array(z.string().min(1)).optional(),
    poolToolCategories: z.array(z.string()).optional(),
    poolFilteredToolSlugs: z.array(z.string().min(1)).optional(),
  })
  .superRefine((row, ctx) => {
    refineToolProficiencyPoolFormRow(row as ToolProficiencyPoolFormRow, ctx, {
      slugPath: 'poolToolSlugs',
      categoriesPath: 'poolToolCategories',
      filteredSlugsPath: 'poolFilteredToolSlugs',
      skipWhenChooseZero: true,
      choose: row.choose,
    })
  })

export const characterCreationProficienciesFormSchema = z.object({
  skills: characterCreationSkillChoiceFormSchema,
  tools: characterCreationToolChoiceFormSchema,
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

/** Pool-backed tool proficiency choice for the first character-creation tool choice. */
export function characterCreationToolChoiceFields(
  ctx: ContentFormCtx,
  extraFields: FormItem[] = [],
): FormItem[] {
  return [
    {
      type: 'text',
      name: CHARACTER_CREATION_TOOL_CHOICE_LABEL_PATH,
      label: TOOL_PROFICIENCY_CHOICE_LABEL_FIELD,
    },
    ...toolProficiencyPoolFormFields(ctx, {
      names: CHARACTER_CREATION_TOOL_POOL_FIELD_NAMES,
      chooseMin: 0,
      chooseDefault: 0,
      chooseDigits: 1,
      sentenceName: CHARACTER_CREATION_TOOL_POOL_FIELD_NAMES.choose,
    }),
    ...extraFields,
  ]
}

/** Proficiencies group on the Character creation tab (skill and tool choices). */
export function characterCreationProficienciesFields(
  ctx: ContentFormCtx,
  toolChoiceExtraFields: FormItem[] = [],
): FormItem[] {
  return [
    {
      kind: 'group',
      legend: 'Proficiencies',
      fields: [
        {
          kind: 'group',
          legend: 'Skill Proficiencies',
          legendSize: 'subsection',
          fields: characterCreationSkillChoiceFields(ctx),
        },
        {
          kind: 'group',
          legend: 'Tool Proficiencies',
          legendSize: 'subsection',
          id: 'class-character-creation-tool-proficiencies',
          fields: characterCreationToolChoiceFields(ctx, toolChoiceExtraFields),
        },
      ],
    },
  ]
}
