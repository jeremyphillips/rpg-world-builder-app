import { z } from 'zod'

import { areaGeometrySchema } from '../primitives/area-geometry'
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
import { spellAtomicEffectSchema } from './spell/effects'

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
  /** Structured area geometry; supplements description prose. Origin not modeled. */
  areaOfEffect: areaGeometrySchema.optional(),
  duration: spellDurationSchema,
  components: spellComponentsSchema,
  deliveryMethod: spellDeliveryMethodSchema.optional(),
  /** Rich-text HTML (TipTap). Cantrip scaling body prose — no "Cantrip Upgrade" heading. */
  cantripScaling: z.string().optional(),
  /** Rich-text HTML (TipTap). Upcast body prose — no "Using a Higher-Level Spell Slot" heading. */
  higherLevelSlotEffect: z.string().optional(),
  /** Structured atomic effects; optional until catalog/homebrew authoring lands. */
  effects: z.array(spellAtomicEffectSchema).optional(),
})

export type SpellBody = z.infer<typeof spellBodySchema>

/**
 * Spell body fields included in create/update API input today.
 * Effects are intentionally omitted until `spell.effect.persistence` lands.
 */
export const spellPersistedBodySchema = spellBodySchema.omit({ effects: true })

export type SpellPersistedBody = z.infer<typeof spellPersistedBodySchema>

/** Stored shape = ownership envelope + body. */
export const spellSchema = contentMetaSchema.extend(spellBodySchema.shape)
export type Spell = z.infer<typeof spellSchema>

export const createSpellInputSchema = spellPersistedBodySchema.extend({ slug: slugSchema })
export type CreateSpellInput = z.infer<typeof createSpellInputSchema>

export const updateSpellInputSchema = createSpellInputSchema.partial()
export type UpdateSpellInput = z.infer<typeof updateSpellInputSchema>

export const spellPatchSchema = contentPatchBaseSchema.extend({
  patch: spellBodySchema.partial(),
})
export type SpellPatch = z.infer<typeof spellPatchSchema>

export {
  deriveEffectsModelingStatus,
  EFFECTS_MODELING_STATUS,
  EFFECTS_MODELING_STATUS_LABELS,
  effectKindPrefix,
  getEffectsModelingStatusLabel,
  formatAtomicEffectSummaries,
  formatAtomicEffectSummary,
  formatDamageValue,
  formatEffectRowSentence,
  formatEffectRowTitle,
  formatEffectRowTitleFromParts,
  spellAtomicEffectSchema,
  SPELL_ATOMIC_EFFECT_KINDS,
  type EffectsModelingStatus,
  type SpellAtomicEffect,
  type SpellAtomicEffectKind,
  type SpellDamageEffect,
  type SpellHealingEffect,
  type SpellProjectileCountEffect,
  type SpellTemporaryHitPointsEffect,
} from './spell/effects'
export {
  getSpellAtomicEffectKindLabel,
  HIT_POINTS_TERM,
  SPELL_ATOMIC_EFFECT_KIND_ENTRIES,
} from '../vocab/spell/atomic-effect-kind'
