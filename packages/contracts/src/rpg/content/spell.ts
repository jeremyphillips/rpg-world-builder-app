import { z } from 'zod'

import {
  spellCastingTimeSchema,
  spellComponentsSchema,
  spellDeliveryMethodSchema,
  spellDurationSchema,
  spellRangeSchema,
  spellSchoolIdSchema,
  spellTagsSchema,
} from '../vocab/spell'
import {
  contentBodyBaseSchema,
  contentMetaSchema,
  contentPatchBaseSchema,
  slugSchema,
} from './lib/envelope'
import { classSlugSchema } from './classes/class'

// ---------------------------------------------------------------------------
// Spell level — 0 (cantrip) through 9. Distinct from `spellLevelSchema` in
// `spell-levels.ts`, which covers slot levels 1–9 only.
// ---------------------------------------------------------------------------

export const MIN_SPELL_CONTENT_LEVEL = 0
export const MAX_SPELL_CONTENT_LEVEL = 9

export const spellContentLevelSchema = z
  .number()
  .int()
  .min(MIN_SPELL_CONTENT_LEVEL)
  .max(MAX_SPELL_CONTENT_LEVEL)

export type SpellContentLevel = z.infer<typeof spellContentLevelSchema>

// ---------------------------------------------------------------------------
// Spell — prose-first catalog content. Structured fields are reference metadata
// for display and filtering; all mechanical detail lives in `description` HTML.
// ---------------------------------------------------------------------------

/** The editable shape: what a form authors and what a patch overrides. */
export const spellBodySchema = contentBodyBaseSchema.extend({
  school: spellSchoolIdSchema,
  level: spellContentLevelSchema,
  /** Class slugs that can learn or cast this spell (SRD or homebrew). */
  classIds: z.array(classSlugSchema).min(1),
  tags: spellTagsSchema.optional(),
  castingTime: spellCastingTimeSchema,
  range: spellRangeSchema,
  duration: spellDurationSchema,
  components: spellComponentsSchema,
  deliveryMethod: spellDeliveryMethodSchema.optional(),
})

export type SpellBody = z.infer<typeof spellBodySchema>

/** Stored shape = ownership envelope + body. */
export const spellSchema = contentMetaSchema.extend(spellBodySchema.shape)
export type Spell = z.infer<typeof spellSchema>

export const createSpellInputSchema = spellBodySchema.extend({ slug: slugSchema })
export type CreateSpellInput = z.infer<typeof createSpellInputSchema>

export const updateSpellInputSchema = createSpellInputSchema.partial()
export type UpdateSpellInput = z.infer<typeof updateSpellInputSchema>

export const spellPatchSchema = contentPatchBaseSchema.extend({
  patch: spellBodySchema.partial(),
})
export type SpellPatch = z.infer<typeof spellPatchSchema>
