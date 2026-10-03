import { z } from 'zod'

// ---------------------------------------------------------------------------
// Character build advisory — a non-blocking consequence of a valid build
// (e.g. owning equipment without proficiency). Distinct from
// CharacterBuildValidationIssue, which always blocks. Copy is derived from the
// typed facts via resolveCharacterBuildAdvisoryMessage; nothing stores prose.
// ---------------------------------------------------------------------------

export const EQUIPMENT_ADVISORY_CLASSES = ['weapon', 'armor', 'shield'] as const
export type EquipmentAdvisoryClass = (typeof EQUIPMENT_ADVISORY_CLASSES)[number]

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

export const characterBuildAdvisorySchema = z.discriminatedUnion('code', [
  equipmentNotProficientAdvisorySchema,
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
] as const satisfies readonly CharacterBuildAdvisoryCode[]

/** Stable dedupe/lookup key derived from the advisory's facts. */
export function characterBuildAdvisoryKey(advisory: CharacterBuildAdvisory): string {
  switch (advisory.code) {
    case 'equipment_not_proficient':
      return `${advisory.code}:equipment:${advisory.subject.equipmentId}`
  }
}
