import { z } from 'zod'

import { damageTypeSchema } from '../damage-type'
import { effectConditionSchema } from '../effect-condition'

import { spellFunctionTagSchema } from './function-tag'
import { spellRoleTagSchema } from './role-tag'

export const spellTagsSchema = z.object({
  damageTypes: z.array(damageTypeSchema).optional(),
  conditions: z.array(effectConditionSchema).optional(),
  roles: z.array(spellRoleTagSchema).optional(),
  functions: z.array(spellFunctionTagSchema).optional(),
})

export type SpellTags = z.infer<typeof spellTagsSchema>
