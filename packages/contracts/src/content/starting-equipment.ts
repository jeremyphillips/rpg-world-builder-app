import { z } from 'zod'

import { toolCategorySchema } from '../vocab/equipment/tool-category'
import {
  contentChoiceOptionSchema,
  contentChoiceSchema,
  contentPoolChoiceSchema,
} from './lib/choice'
import { characterWealthGrantSchema } from './character'
import { equipmentModifierSchema } from './equipment/modifier'

// ---------------------------------------------------------------------------
// Starting equipment — class/background character-creation gear packages.
// ---------------------------------------------------------------------------

export const startingEquipmentFixedItemSchema = z.object({
  kind: z.literal('fixed'),
  /** Bare equipment slug; resolved to `{rulesetId}:{slug}` at build time. */
  equipmentSlug: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
  equipped: z.boolean().optional(),
  modifiers: z.array(equipmentModifierSchema).optional(),
})

export type StartingEquipmentFixedItem = z.infer<typeof startingEquipmentFixedItemSchema>

/**
 * Structured pick within a starting package (e.g. Bard musical instrument).
 *
 * Cross-reference choices tied to another proficiency pick (Monk tool/instrument
 * linked to class tool proficiency) are prose-only in v1 — see catalog Monk seed
 * and FOLLOWUP: proficiencyLinkedChoice.
 */
export const startingEquipmentItemChoiceSchema = contentPoolChoiceSchema
  .extend({
    kind: z.literal('choice'),
    label: z.string().min(1),
    from: z
      .object({
        equipmentSlugs: z.array(z.string().min(1)).min(1).optional(),
        toolCategories: z.array(toolCategorySchema).min(1).optional(),
      })
      .strict(),
  })
  .superRefine((val, ctx) => {
    if (val.from.equipmentSlugs === undefined && val.from.toolCategories === undefined) {
      ctx.addIssue({
        code: 'custom',
        message: 'item choices require equipmentSlugs and/or toolCategories',
        path: ['from'],
      })
    }
  })

export type StartingEquipmentItemChoice = z.infer<typeof startingEquipmentItemChoiceSchema>

export const startingEquipmentItemSchema = z.discriminatedUnion('kind', [
  startingEquipmentFixedItemSchema,
  startingEquipmentItemChoiceSchema,
])

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
