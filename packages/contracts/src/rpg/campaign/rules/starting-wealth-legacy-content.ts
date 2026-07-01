import { z } from 'zod'

import { systemRulesetIdSchema } from '../../primitives/ruleset'
import { startingWealthRulesSchema, type StartingWealthRules } from './starting-wealth'

// ---------------------------------------------------------------------------
// Legacy content-kernel shapes — duplicate content envelope fields here because
// campaign must not import rpg/content. Removed when Phase 8 drops the content
// API registry for starting wealth.
// ---------------------------------------------------------------------------

const legacyContentSlugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

const legacyContentMetaSchema = z.object({
  id: z.string().min(1),
  slug: legacyContentSlugSchema,
  rulesetId: systemRulesetIdSchema,
  source: z.enum(['system', 'homebrew']),
  campaignId: z.string().min(1).nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

const legacyContentPatchBaseSchema = z.object({
  id: z.string().min(1),
  campaignId: z.string().min(1),
  targetId: z.string().min(1),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

/** @deprecated Use `startingWealthRulesSchema` — content envelope body alias until Phase 8. */
export const startingWealthBodySchema = startingWealthRulesSchema

/** @deprecated Use `StartingWealthRules`. */
export type StartingWealthBody = StartingWealthRules

/** Stored content-kernel shape = ownership envelope + rules body. */
export const startingWealthSchema = legacyContentMetaSchema.extend(startingWealthRulesSchema.shape)

export type StartingWealth = z.infer<typeof startingWealthSchema>

export const createStartingWealthInputSchema = startingWealthRulesSchema.extend({
  slug: legacyContentSlugSchema,
})

export type CreateStartingWealthInput = z.infer<typeof createStartingWealthInputSchema>

export const updateStartingWealthInputSchema = createStartingWealthInputSchema.partial()

export type UpdateStartingWealthInput = z.infer<typeof updateStartingWealthInputSchema>

export const startingWealthPatchSchema = legacyContentPatchBaseSchema.extend({
  patch: startingWealthRulesSchema.partial(),
})

export type StartingWealthPatch = z.infer<typeof startingWealthPatchSchema>
