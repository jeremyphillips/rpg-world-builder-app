import { z } from 'zod'

// ---------------------------------------------------------------------------
// Character build advisory — a non-blocking consequence of a valid build
// (e.g. owning equipment without proficiency). Distinct from
// CharacterBuildValidationIssue, which always blocks. Copy is derived from the
// typed facts via resolveCharacterBuildAdvisoryMessage; nothing stores prose.
// ---------------------------------------------------------------------------

export const EQUIPMENT_ADVISORY_CLASSES = ['weapon', 'armor', 'shield'] as const
export type EquipmentAdvisoryClass = (typeof EQUIPMENT_ADVISORY_CLASSES)[number]

/** Mirrors vocab `ABILITY_IDS` (this layer may not import vocab); locked by test. */
export const BUILD_ADVISORY_ABILITY_IDS = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const

const unmetAbilityScoreAdvisoryEntrySchema = z.object({
  ability: z.enum(BUILD_ADVISORY_ABILITY_IDS),
  required: z.number().int(),
  actual: z.number().int(),
})

const equipmentNotProficientAdvisorySchema = z.object({
  code: z.literal('equipment_not_proficient'),
  subject: z.object({
    kind: z.literal('equipment'),
    /** Normalized equipment content id. */
    equipmentId: z.string().min(1),
    /** Display name. */
    label: z.string().min(1),
    /** `shield` is armor with category `shields`. */
    equipmentClass: z.enum(EQUIPMENT_ADVISORY_CLASSES),
  }),
})

const equipmentAbilityScoreRequirementUnmetAdvisorySchema = z.object({
  code: z.literal('equipment_ability_score_requirement_unmet'),
  subject: z.object({
    kind: z.literal('equipment'),
    /** Normalized equipment content id. */
    equipmentId: z.string().min(1),
    /** Display name. */
    label: z.string().min(1),
    /** Unmet minimums in `ABILITY_IDS` order. */
    unmet: z.array(unmetAbilityScoreAdvisoryEntrySchema).min(1),
  }),
})

export const characterBuildAdvisorySchema = z.discriminatedUnion('code', [
  equipmentNotProficientAdvisorySchema,
  equipmentAbilityScoreRequirementUnmetAdvisorySchema,
])

export type CharacterBuildAdvisory = z.infer<typeof characterBuildAdvisorySchema>
export type CharacterBuildAdvisoryCode = CharacterBuildAdvisory['code']
export type CharacterBuildAdvisoryOfCode<C extends CharacterBuildAdvisoryCode> = Extract<
  CharacterBuildAdvisory,
  { code: C }
>

/** Exhaustive display/sort order. */
export const CHARACTER_BUILD_ADVISORY_CODE_ORDER = [
  'equipment_not_proficient',
  'equipment_ability_score_requirement_unmet',
] as const satisfies readonly CharacterBuildAdvisoryCode[]

/** Stable dedupe/lookup key derived from the advisory's facts. One per item, regardless of quantity. */
export function characterBuildAdvisoryKey(advisory: CharacterBuildAdvisory): string {
  switch (advisory.code) {
    case 'equipment_not_proficient':
    case 'equipment_ability_score_requirement_unmet':
      return `${advisory.code}:equipment:${advisory.subject.equipmentId}`
  }
}
