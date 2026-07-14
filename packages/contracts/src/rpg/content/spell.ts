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
import { spellResolutionSchema } from './spell/resolution'

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
  /** Structured resolution envelope; optional until resolution authoring persistence lands. */
  resolution: spellResolutionSchema.optional(),
})

export type SpellBody = z.infer<typeof spellBodySchema>

/**
 * Spell body fields included in create/update API input today.
 * Effects and resolution are intentionally omitted until persistence lands.
 */
export const spellPersistedBodySchema = spellBodySchema.omit({ effects: true, resolution: true })

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
  formatEffectRowSentenceFromParts,
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
  formatResolutionApplicationPattern,
  formatResolutionDamage,
  formatResolutionDamageRoll,
  formatResolutionEffectsApplicationLabel,
  formatResolutionMethod,
  formatResolutionOutcomeLine,
  formatResolutionOutcomes,
  formatResolutionProjectilesPreview,
  formatResolutionRange,
  formatResolutionSummary,
  formatResolutionSummarySections,
  formatResolutionTarget,
  formatResolutionTargetFromParts,
  formatResolutionTargetProximityPhrase,
  findResolutionDamageEffects,
  SPELL_APPLICATION_PATTERN_APPLICATION_MODES,
  SPELL_APPLICATION_PATTERN_COUNT_TYPES,
  SPELL_APPLICATION_PATTERN_KIND_ENTRIES,
  SPELL_APPLICATION_PATTERN_KINDS,
  SPELL_RESOLUTION_APPLICATION_AMOUNT_ENTRIES,
  SPELL_RESOLUTION_APPLICATION_AMOUNTS,
  SPELL_RESOLUTION_ATTACK_TYPE_ENTRIES,
  SPELL_RESOLUTION_ATTACK_TYPES,
  SPELL_RESOLUTION_FIXTURES,
  SPELL_RESOLUTION_OUTCOME_RESULT_ENTRIES,
  SPELL_RESOLUTION_OUTCOME_RESULTS,
  SPELL_RESOLUTION_OUTCOME_RESULTS_BY_METHOD,
  SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
  SPELL_RESOLUTION_PROXIMITY_KIND_ENTRIES,
  SPELL_RESOLUTION_PROXIMITY_KINDS,
  SPELL_RESOLUTION_RANGE_KIND_ENTRIES,
  SPELL_RESOLUTION_RANGE_KINDS,
  SPELL_RESOLUTION_TARGET_KIND_ENTRIES,
  SPELL_RESOLUTION_TARGET_KINDS,
  spellResolutionApplicationSchema,
  spellApplicationPatternFixedCountSchema,
  spellApplicationPatternProjectilesSchema,
  spellApplicationPatternSchema,
  spellApplicationPatternUnitLabelSchema,
  spellResolutionDamageEffectSchema,
  spellResolutionEffectIdSchema,
  spellResolutionEffectSchema,
  spellResolutionMethodSchema,
  spellResolutionOutcomeSchema,
  spellResolutionRangeSchema,
  spellResolutionSchema,
  spellResolutionTargetProximitySchema,
  spellResolutionTargetSchema,
  spellResolutionValidationMessages,
  validateSpellResolutionReferences,
  getSpellApplicationPatternKindLabel,
  getSpellResolutionApplicationAmountLabel,
  getSpellResolutionAttackTypeLabel,
  getSpellResolutionOutcomeResultLabel,
  getSpellResolutionProximityKindLabel,
  getSpellResolutionRangeKindLabel,
  getSpellResolutionTargetKindLabel,
  CHILL_TOUCH_RESOLUTION,
  CURE_WOUNDS_RESOLUTION,
  ELDRITCH_BLAST_RESOLUTION,
  FALSE_LIFE_RESOLUTION,
  ICE_KNIFE_RESOLUTION,
  ARCANE_HAND_RESOLUTION,
  INFlict_WOUNDS_RESOLUTION,
  MAGIC_MISSILE_RESOLUTION,
  deriveDefaultEffectRecipient,
  deriveResolutionModelingStatus,
  formatResolutionAvailabilityReason,
  getApplicationPatternAvailability,
  getEffectKindAvailability,
  getMethodAvailability,
  getResolutionModelingStatusLabel,
  planResolutionChange,
  resolutionChangeRequiresConfirm,
  RESOLUTION_METHOD_OPTIONS,
  RESOLUTION_MODELING_STATUS,
  RESOLUTION_MODELING_STATUS_LABELS,
  buildIncompatibleSelectionClearPatch,
  applyResolutionStructuralCleanup,
  toMethodOption,
  SPELL_RESOLUTION_PRIMARY_HEALING_EFFECT_ID,
  SPELL_RESOLUTION_PRIMARY_TEMPORARY_HIT_POINTS_EFFECT_ID,
  spellResolutionHealingEffectSchema,
  spellResolutionTemporaryHitPointsEffectSchema,
  type ResolutionModelingStatus,
  type ResolutionChangePlan,
  type ResolutionChangeRequest,
  type ResolutionMethodOption,
  type ResolutionSelectionState,
  type ResolutionEffectKind,
  type ResolutionEffectRef,
  type EffectRecipient,
  type SpellApplicationPattern,
  type SpellApplicationPatternApplicationMode,
  type SpellApplicationPatternCountType,
  type SpellApplicationPatternFixedCount,
  type SpellApplicationPatternKind,
  type SpellApplicationPatternProjectiles,
  type SpellApplicationPatternUnitLabel,
  type SpellResolutionHealingEffect,
  type SpellResolutionTemporaryHitPointsEffect,
  type SpellResolution,
  type SpellResolutionApplication,
  type SpellResolutionApplicationAmount,
  type SpellResolutionAttackType,
  type SpellResolutionDamageEffect,
  type SpellResolutionEffect,
  type SpellResolutionEffectId,
  type SpellResolutionMethod,
  type SpellResolutionOutcome,
  type SpellResolutionOutcomeResult,
  type SpellResolutionProximityKind,
  type SpellResolutionRange,
  type SpellResolutionRangeKind,
  type SpellResolutionSummarySection,
  type SpellResolutionTarget,
  type SpellResolutionTargetKind,
  type SpellResolutionTargetProximity,
} from './spell/resolution'
export {
  getSpellAtomicEffectKindLabel,
  SPELL_ATOMIC_EFFECT_KIND_ENTRIES,
} from '../vocab/spell/atomic-effect-kind'
export { HIT_POINTS_TERM } from '../primitives/mechanics/hit-points-term'
