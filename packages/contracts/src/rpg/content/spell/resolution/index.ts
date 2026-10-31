export {
  formatResolutionApplicationPattern,
  formatResolutionEffectsApplicationLabel,
  formatResolutionMethod,
  formatResolutionProjectilesPreview,
  formatResolutionSummary,
  formatResolutionSummarySections,
  type SpellResolutionSummarySection,
} from './format'
export {
  ARCANE_HAND_RESOLUTION,
  BURNING_HANDS_RESOLUTION,
  CHILL_TOUCH_RESOLUTION,
  CURE_WOUNDS_RESOLUTION,
  ELDRITCH_BLAST_RESOLUTION,
  FALSE_LIFE_RESOLUTION,
  FIREBALL_RESOLUTION,
  ICE_KNIFE_RESOLUTION,
  INFlict_WOUNDS_RESOLUTION,
  MAGIC_MISSILE_RESOLUTION,
  MASS_HEALING_WORD_RESOLUTION,
  SPELL_RESOLUTION_FIXTURES,
} from './fixtures'
export {
  spellApplicationPatternFixedCountSchema,
  spellApplicationPatternProjectilesSchema,
  spellApplicationPatternSchema,
  spellApplicationPatternUnitLabelSchema,
  spellResolutionMethodSchema,
  spellResolutionSchema,
  validateSpellResolutionReferences,
  type SpellApplicationPattern,
  type SpellApplicationPatternFixedCount,
  type SpellApplicationPatternProjectiles,
  type SpellApplicationPatternUnitLabel,
  type SpellResolution,
  type SpellResolutionMethod,
} from './schema'
export {
  defaultOriginFromSpellRange,
  inferPointSelectionModeFromSpell,
} from './normalize-resolution'
export { getSpellResolutionAreaMismatchWarning } from './spell-resolution-warnings'
export {
  getSpellApplicationPatternKindLabel,
  getSpellResolutionAttackTypeLabel,
  SPELL_APPLICATION_PATTERN_APPLICATION_MODES,
  SPELL_APPLICATION_PATTERN_COUNT_TYPES,
  SPELL_APPLICATION_PATTERN_KIND_ENTRIES,
  SPELL_APPLICATION_PATTERN_KINDS,
  SPELL_RESOLUTION_ATTACK_TYPE_ENTRIES,
  SPELL_RESOLUTION_ATTACK_TYPES,
  type SpellApplicationPatternApplicationMode,
  type SpellApplicationPatternCountType,
  type SpellApplicationPatternKind,
  type SpellResolutionAttackType,
} from './vocab'
export {
  BLESS_PROGRESSION_FIXTURE_RESOLUTION,
  BLESS_TARGET_COUNT_PROGRESSION,
  ELDRITCH_BLAST_PROGRESSION,
  FIRE_BOLT_PROGRESSION,
  FIREBALL_PROGRESSION,
  MAGIC_MISSILE_PROGRESSION,
  POISON_SPRAY_PROGRESSION,
  SPELL_RESOLUTION_PROGRESSION_FIXTURES,
} from './progression/fixtures'
export {
  formatPerProjectileDamageLine,
  formatProgressionTrackSummary,
  formatResolutionProgressionSummary,
  type FormatProgressionTrackOptions,
} from './progression/format'
export {
  findResolutionEffectById,
  formatProgressionBaseValueLabel,
  formatProgressionTrackHeading,
  isRollBearingResolutionEffect,
  listCompatibleProgressionReferences,
  readProgressionBaseCount,
  readProgressionBaseRoll,
  readProgressionBaseValue,
  referencesEqual,
  type ProgressionReferenceContext,
  type ProgressionResolutionContext,
} from './progression/references'
export {
  resolveLinearValueAtSlot,
  resolveProgressionValueAtCharacterLevel,
  resolveProgressionValueAtSlotLevel,
  resolveThresholdValueAtLevel,
} from './progression/resolve'
export {
  isValidSpellResolutionProgressionReferencePair,
  SPELL_RESOLUTION_PROGRESSION_BASES,
  SPELL_RESOLUTION_PROGRESSION_PROPERTIES,
  SPELL_RESOLUTION_PROGRESSION_SUBJECT_KINDS,
  spellResolutionProgressionBasisSchema,
  spellResolutionProgressionCountValueSchema,
  spellResolutionProgressionLinearTrackSchema,
  spellResolutionProgressionReferenceSchema,
  spellResolutionProgressionRollValueSchema,
  spellResolutionProgressionSchema,
  spellResolutionProgressionSubjectSchema,
  spellResolutionProgressionThresholdEntrySchema,
  spellResolutionProgressionThresholdTrackSchema,
  spellResolutionProgressionTrackSchema,
  spellResolutionProgressionValueSchema,
  VALID_SPELL_RESOLUTION_PROGRESSION_REFERENCE_PAIRS,
  type SpellResolutionProgression,
  type SpellResolutionProgressionBasis,
  type SpellResolutionProgressionProperty,
  type SpellResolutionProgressionReference,
  type SpellResolutionProgressionSubject,
  type SpellResolutionProgressionSubjectKind,
  type SpellResolutionProgressionThresholdEntry,
  type SpellResolutionProgressionTrack,
  type SpellResolutionProgressionValue,
} from './progression/schema'
export {
  validateSpellResolutionProgression,
  type SpellResolutionProgressionValidationOptions,
} from './progression/validation'
export { spellResolutionProgressionValidationMessages } from './progression/validation-messages'
export {
  formatResolutionAvailabilityReason,
  type ResolutionAvailabilityTone,
} from './availability-reasons'
