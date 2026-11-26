import { z } from 'zod'

import { overlaySlugList } from '../../content/lib/system-overlay/overlay-presets'

import { damageTypeIdSchema } from '../damage/vocabulary'
import { effectConditionSchema } from '../effect-condition'

import { spellFunctionTagSchema } from './function-tag'
import { spellRoleTagSchema } from './role-tag'

export const spellTagsSchema = z.object({
  damageTypes: overlaySlugList(damageTypeIdSchema).optional(),
  conditions: overlaySlugList(effectConditionSchema).optional(),
  roles: overlaySlugList(spellRoleTagSchema).optional(),
  functions: overlaySlugList(spellFunctionTagSchema).optional(),
})

export type SpellTags = z.infer<typeof spellTagsSchema>
