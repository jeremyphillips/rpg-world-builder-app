import { z } from 'zod'

import { contentChoiceOptionSchema, contentChoiceSchema } from './lib/choice'
import {
  equipmentChoiceGrantObjectSchema,
  fixedEquipmentGrantSchema,
  normalizeEquipmentChoiceGrant,
} from './lib/equipment-grant'
import { characterWealthGrantSchema } from './lib/wealth-grant'

// ---------------------------------------------------------------------------
// Starting equipment — class/background character-creation gear packages.
// ---------------------------------------------------------------------------

export const startingEquipmentFixedItemSchema = fixedEquipmentGrantSchema

export type StartingEquipmentFixedItem = z.infer<typeof startingEquipmentFixedItemSchema>

/**
 * Structured pick within a starting package (e.g. Bard musical instrument).
 *
 * Cross-reference choices tied to another proficiency pick (Monk tool/instrument
 * linked to class tool proficiency) are prose-only in v1 — see catalog Monk seed
 * and FOLLOWUP: proficiencyLinkedChoice.
 */
export const startingEquipmentItemChoiceSchema = z.preprocess(
  normalizeEquipmentChoiceGrant,
  equipmentChoiceGrantObjectSchema,
)

export type StartingEquipmentItemChoice = z.infer<typeof equipmentChoiceGrantObjectSchema>

export const startingEquipmentItemSchema = z.preprocess(
  (input) =>
    typeof input === 'object' &&
    input !== null &&
    (input as Record<string, unknown>).kind === 'choice'
      ? normalizeEquipmentChoiceGrant(input)
      : input,
  z.discriminatedUnion('kind', [
    startingEquipmentFixedItemSchema,
    equipmentChoiceGrantObjectSchema,
  ]),
)

export type StartingEquipmentItem = z.infer<typeof startingEquipmentItemSchema>

export const startingEquipmentOptionSchema = contentChoiceOptionSchema.extend({
  items: z.array(startingEquipmentItemSchema),
  wealth: characterWealthGrantSchema.optional(),
})

export type StartingEquipmentOption = z.infer<typeof startingEquipmentOptionSchema>

export const startingEquipmentChoiceSchema = contentChoiceSchema.extend({
  options: z.array(startingEquipmentOptionSchema).min(1),
})

export type StartingEquipmentChoice = z.infer<typeof startingEquipmentChoiceSchema>

export const classCharacterCreationSchema = z.object({
  startingEquipment: startingEquipmentChoiceSchema,
})

export type ClassCharacterCreation = z.infer<typeof classCharacterCreationSchema>

/** Resolves a bare equipment slug to the opaque catalog content id for a ruleset. */
export function resolveEquipmentContentId(rulesetId: string, equipmentSlug: string): string {
  return `${rulesetId}:${equipmentSlug}`
}
