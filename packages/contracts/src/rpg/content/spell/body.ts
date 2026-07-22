import { z } from 'zod'

import { coercedSelectNumberSchema } from '../../primitives/level'
import { areaGeometrySchema } from '../../primitives/area-geometry'
import {
  spellCastingTimeSchema,
  spellComponentsSchema,
  spellDeliveryMethodSchema,
  spellDurationSchema,
  spellRangeSchema,
  spellSchoolIdSchema,
  spellTagsSchema,
} from '../../vocab/spell'
import {
  contentBodyBaseSchema,
  contentMetaSchema,
  contentPatchBaseSchema,
  slugSchema,
} from '../lib/envelope'
import { classSlugSchema } from '../classes/class'
import { contentModelingSchema } from '../../primitives/modeling/schema'
import { spellResolutionSchema } from './resolution'

// ---------------------------------------------------------------------------
// Spell level — 0 (cantrip) through 9. Distinct from `spellLevelSchema` in
// `levels.ts`, which covers slot levels 1–9 only.
// ---------------------------------------------------------------------------

export const MIN_SPELL_CONTENT_LEVEL = 0
export const MAX_SPELL_CONTENT_LEVEL = 9

export const spellContentLevelSchema = z
  .number()
  .int()
  .min(MIN_SPELL_CONTENT_LEVEL)
  .max(MAX_SPELL_CONTENT_LEVEL)

export type SpellContentLevel = z.infer<typeof spellContentLevelSchema>

/** Spell level `<select>` input — blank fails; `"0"`/`"1"` coerce to cantrip/leveled slots. */
export const spellFormLevelSchema = coercedSelectNumberSchema(spellContentLevelSchema)

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
  /** Structured area geometry; supplements description prose. Origin not modeled. */
  areaOfEffect: areaGeometrySchema.optional(),
  duration: spellDurationSchema,
  components: spellComponentsSchema,
  deliveryMethod: spellDeliveryMethodSchema.optional(),
  /** Rich-text HTML (TipTap). Cantrip scaling body prose — no "Cantrip Upgrade" heading. */
  cantripScaling: z.string().optional(),
  /** Rich-text HTML (TipTap). Upcast body prose — no "Using a Higher-Level Spell Slot" heading. */
  higherLevelSlotEffect: z.string().optional(),
  /** Structured resolution envelope for spell execution modeling. */
  resolution: spellResolutionSchema.optional(),
  /** Human-reviewed modeling posture; absent until audited. */
  modeling: contentModelingSchema.optional(),
})

export type SpellBody = z.infer<typeof spellBodySchema>

/** Spell body fields included in create/update API input. */
export const spellPersistedBodySchema = spellBodySchema

export type SpellPersistedBody = z.infer<typeof spellPersistedBodySchema>

/** Stored shape = ownership envelope + body. */
export const spellSchema = contentMetaSchema.extend(spellBodySchema.shape)
export type Spell = z.infer<typeof spellSchema>

export const createSpellInputSchema = spellPersistedBodySchema.extend({ slug: slugSchema })
export type CreateSpellInput = z.infer<typeof createSpellInputSchema>

/**
 * PATCH semantics for `resolution`:
 * - omitted → leave stored resolution unchanged
 * - `null` → remove stored resolution
 * - object → replace stored resolution entirely
 */
export const updateSpellInputSchema = createSpellInputSchema.partial().extend({
  resolution: spellResolutionSchema.nullable().optional(),
})
export type UpdateSpellInput = z.infer<typeof updateSpellInputSchema>

export const spellPatchSchema = contentPatchBaseSchema.extend({
  patch: spellBodySchema.partial(),
})
export type SpellPatch = z.infer<typeof spellPatchSchema>
