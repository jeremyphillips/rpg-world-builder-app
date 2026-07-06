import { z } from 'zod'

import { armorCategorySchema } from '../../vocab/armor/category'
import { toolCategorySchema } from '../../vocab/equipment/tool-category'
import { weaponCategorySchema } from '../../vocab/weapon/category'
import { skillSchema } from '../skill-proficiency'

// ---------------------------------------------------------------------------
// Proficiency grant sets — fixed grants on class.proficiencies (immediate).
// Proficiency choices — player picks under class.characterCreation.proficiencies.
// ---------------------------------------------------------------------------

/** Fixed grant bucket: category and/or item slugs granted immediately. */
export const proficiencyGrantSetSchema = z
  .object({
    categories: z.array(z.string()).default([]),
    items: z.array(z.string()).default([]),
  })
  .strict()

export type ProficiencyGrantSet = z.infer<typeof proficiencyGrantSetSchema>

export const armorProficiencyGrantSetSchema = proficiencyGrantSetSchema.extend({
  categories: z.array(armorCategorySchema).default([]),
})

export type ArmorProficiencyGrantSet = z.infer<typeof armorProficiencyGrantSetSchema>

export const weaponProficiencyGrantSetSchema = proficiencyGrantSetSchema.extend({
  categories: z.array(weaponCategorySchema).default([]),
})

export type WeaponProficiencyGrantSet = z.infer<typeof weaponProficiencyGrantSetSchema>

export const toolProficiencyGrantSetSchema = proficiencyGrantSetSchema.extend({
  categories: z.array(toolCategorySchema).default([]),
})

export type ToolProficiencyGrantSet = z.infer<typeof toolProficiencyGrantSetSchema>

export const skillProficiencyGrantSetSchema = proficiencyGrantSetSchema.extend({
  items: z.array(skillSchema).default([]),
})

export type SkillProficiencyGrantSet = z.infer<typeof skillProficiencyGrantSetSchema>

/** Domain-agnostic choice primitive — `from` holds opaque slugs; vocab validated on extensions. */
export const proficiencyChoiceSchema = z.object({
  id: z.string().min(1),
  label: z.string().optional(),
  choose: z.number().int().min(0),
  from: z.array(z.string()).default([]),
})

export type ProficiencyChoice = z.infer<typeof proficiencyChoiceSchema>

/** A choice is meaningful when the player must pick from a non-empty pool. */
export function isMeaningfulProficiencyChoice(choice: ProficiencyChoice): boolean {
  return choice.choose > 0 && choice.from.length > 0
}

const MEANINGFUL_CHOICE_GROUP_MESSAGE =
  'Choice group must contain at least one meaningful choice (choose > 0 and from non-empty)'

function refineMeaningfulChoiceGroup(
  choices: readonly ProficiencyChoice[],
  ctx: z.RefinementCtx,
): void {
  if (!choices.some(isMeaningfulProficiencyChoice)) {
    ctx.addIssue({
      code: 'custom',
      message: MEANINGFUL_CHOICE_GROUP_MESSAGE,
      path: ['choices'],
    })
  }
}

export const proficiencyChoiceGroupSchema = z
  .object({
    choices: z.array(proficiencyChoiceSchema).min(1),
  })
  .superRefine((group, ctx) => {
    refineMeaningfulChoiceGroup(group.choices, ctx)
  })

export type ProficiencyChoiceGroup = z.infer<typeof proficiencyChoiceGroupSchema>

export const skillProficiencyChoiceSchema = proficiencyChoiceSchema.extend({
  from: z.array(skillSchema).default([]),
})

export type SkillProficiencyChoice = z.infer<typeof skillProficiencyChoiceSchema>

export const skillProficiencyChoiceGroupSchema = z
  .object({
    choices: z.array(skillProficiencyChoiceSchema).min(1),
  })
  .superRefine((group, ctx) => {
    refineMeaningfulChoiceGroup(group.choices, ctx)
  })

export type SkillProficiencyChoiceGroup = z.infer<typeof skillProficiencyChoiceGroupSchema>

export const toolProficiencyChoiceSchema = proficiencyChoiceSchema.extend({
  from: z.array(z.string()).default([]),
})

export type ToolProficiencyChoice = z.infer<typeof toolProficiencyChoiceSchema>

export const toolProficiencyChoiceGroupSchema = z
  .object({
    choices: z.array(toolProficiencyChoiceSchema).min(1),
  })
  .superRefine((group, ctx) => {
    refineMeaningfulChoiceGroup(group.choices, ctx)
  })

export type ToolProficiencyChoiceGroup = z.infer<typeof toolProficiencyChoiceGroupSchema>
