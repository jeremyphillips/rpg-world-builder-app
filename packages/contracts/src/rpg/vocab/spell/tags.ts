import { z } from 'zod'

import { damageTypeIdSchema } from '../damage/vocabulary'
import { effectConditionSchema } from '../effect-condition'

import { spellFunctionTagSchema } from './function-tag'
import { spellRoleTagSchema } from './role-tag'

export const spellTagsSchema = z.object({
  damageTypes: z.array(damageTypeIdSchema).optional(),
  conditions: z.array(effectConditionSchema).optional(),
  roles: z.array(spellRoleTagSchema).optional(),
  functions: z.array(spellFunctionTagSchema).optional(),
})

export type SpellTags = z.infer<typeof spellTagsSchema>
