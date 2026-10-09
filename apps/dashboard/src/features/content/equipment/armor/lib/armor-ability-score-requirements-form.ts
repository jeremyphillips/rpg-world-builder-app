import { z } from 'zod'
import { ABILITY_SCORE_MAX, ABILITY_SCORE_MIN, abilitySchema } from '@rpg/contracts'

/** Stored map field — dotted per-ability names (`abilityScoreRequirements.str`). */
export const ARMOR_ABILITY_SCORE_REQUIREMENTS_FIELD = 'abilityScoreRequirements'

/** Form-only switch gating the Strength minimum. Never persisted. */
export const ARMOR_MINIMUM_STRENGTH_REQUIREMENT_SWITCH = 'hasMinimumStrengthRequirement'

const abilityScoreRequirementFormValueSchema = z.coerce
  .number()
  .int()
  .min(ABILITY_SCORE_MIN)
  .max(ABILITY_SCORE_MAX)
  .optional()

/** Shared by the armor create, draft, and unscoped hub form schemas. */
export const armorAbilityScoreRequirementsFormFields = {
  [ARMOR_MINIMUM_STRENGTH_REQUIREMENT_SWITCH]: z.boolean().optional(),
  [ARMOR_ABILITY_SCORE_REQUIREMENTS_FIELD]: z
    .partialRecord(abilitySchema, abilityScoreRequirementFormValueSchema)
    .optional(),
}
