import { z } from 'zod'

import { contentChoiceOptionSchema, contentChoiceSchema } from './lib/choice'
import {
  equipmentChoiceGrantObjectSchema,
  normalizeEquipmentChoiceGrant,
} from './lib/equipment-grant'
import { equipmentModifierSchema } from './equipment/modifier'
import { equipmentRecommendationsSchema } from './equipment-recommendation'
import { characterWealthGrantSchema } from './lib/wealth-grant'
import {
  skillProficiencyChoiceGroupSchema,
  toolProficiencyChoiceGroupSchema,
} from './lib/proficiency-grant-set'

// ---------------------------------------------------------------------------
// Starting equipment — class/background character-creation gear packages.
// ---------------------------------------------------------------------------

export const startingEquipmentGrantTargetSchema = z.discriminatedUnion('source', [
  z.object({ source: z.literal('equipment'), equipmentSlug: z.string().min(1) }),
  z.object({ source: z.literal('proficiency_choice'), choiceId: z.string().min(1) }),
])

export type StartingEquipmentGrantTarget = z.infer<typeof startingEquipmentGrantTargetSchema>

const PROFICIENCY_LINKED_GRANT_MODIFIERS_MESSAGE =
  'Proficiency-linked starting equipment grants cannot carry modifiers.'

const startingEquipmentGrantedItemObjectSchema = z
  .object({
    kind: z.literal('grant'),
    target: startingEquipmentGrantTargetSchema,
    quantity: z.number().int().min(1).default(1),
    equipped: z.boolean().optional(),
    modifiers: z.array(equipmentModifierSchema).optional(),
  })
  .strict()
  .superRefine((grant, ctx) => {
    if (grant.target.source === 'proficiency_choice' && (grant.modifiers?.length ?? 0) > 0) {
      ctx.addIssue({
        code: 'custom',
        message: PROFICIENCY_LINKED_GRANT_MODIFIERS_MESSAGE,
        path: ['modifiers'],
      })
    }
  })

/**
 * Maps legacy `{ kind: 'grant', equipmentSlug }` rows to `target.source === 'equipment'`.
 * Strips bare `equipmentSlug` on output when `target` is present.
 */
export function normalizeStartingEquipmentGrant(input: unknown): unknown {
  if (typeof input !== 'object' || input === null) return input

  const record = input as Record<string, unknown>
  if (record.kind !== 'grant') return input

  const { equipmentSlug: legacySlug, target: rawTarget, ...rest } = record

  if (rawTarget !== undefined) {
    return { ...rest, target: rawTarget }
  }

  if (typeof legacySlug === 'string' && legacySlug.length > 0) {
    return {
      ...rest,
      target: { source: 'equipment', equipmentSlug: legacySlug },
    }
  }

  return input
}

export const startingEquipmentGrantedItemSchema = z.preprocess(
  normalizeStartingEquipmentGrant,
  startingEquipmentGrantedItemObjectSchema,
)

export type StartingEquipmentGrantedItem = z.infer<typeof startingEquipmentGrantedItemObjectSchema>

export function isProficiencyLinkedStartingEquipmentGrant(
  grant: Pick<StartingEquipmentGrantedItem, 'target'> | { target?: StartingEquipmentGrantTarget },
): grant is StartingEquipmentGrantedItem & {
  target: Extract<StartingEquipmentGrantTarget, { source: 'proficiency_choice' }>
} {
  return grant.target?.source === 'proficiency_choice'
}

export function startingEquipmentGrantEquipmentSlug(
  grant: Pick<StartingEquipmentGrantedItem, 'target'> & { equipmentSlug?: string },
): string | undefined {
  if (grant.target?.source === 'equipment') return grant.target.equipmentSlug
  return grant.equipmentSlug
}

export function startingEquipmentGrantProficiencyChoiceId(
  grant: Pick<StartingEquipmentGrantedItem, 'target'>,
): string | undefined {
  return grant.target?.source === 'proficiency_choice' ? grant.target.choiceId : undefined
}

/** Wealth-only starting packages carry no gear items — structural gold-path detection. */
export function isWealthOnlyStartingEquipmentOption(option: StartingEquipmentOption): boolean {
  return option.items.length === 0 && option.wealth != null
}

/** User-facing alias — same predicate. Prefer at call sites that mean "purchase path". */
export const isStartingGoldOption = isWealthOnlyStartingEquipmentOption

/** Derives persisted equipment mode from option shape (not option id). */
export function resolveEquipmentModeFromOption(
  option: StartingEquipmentOption,
): 'package' | 'gold' {
  return isStartingGoldOption(option) ? 'gold' : 'package'
}

/**
 * Structured pick within a starting package (e.g. Bard musical instrument).
 *
 * Use `kind: 'choice'` when the equipment step should collect a separate answer.
 * Use `kind: 'grant'` with `target.source === 'proficiency_choice'` when the item
 * resolves from an existing character-creation tool proficiency ChoiceSet answer.
 */
export const startingEquipmentItemChoiceSchema = z.preprocess(
  normalizeEquipmentChoiceGrant,
  equipmentChoiceGrantObjectSchema,
)

export type StartingEquipmentItemChoice = z.infer<typeof equipmentChoiceGrantObjectSchema>

export const startingEquipmentItemSchema = z.preprocess(
  (input) => {
    if (typeof input !== 'object' || input === null) return input

    const record = input as Record<string, unknown>
    if (record.kind === 'grant') return normalizeStartingEquipmentGrant(input)
    if (record.kind === 'choice') return normalizeEquipmentChoiceGrant(input)
    return input
  },
  z.discriminatedUnion('kind', [
    startingEquipmentGrantedItemObjectSchema,
    equipmentChoiceGrantObjectSchema,
  ]),
)

export type StartingEquipmentItem = z.infer<typeof startingEquipmentItemSchema>

export const startingEquipmentOptionSchema = contentChoiceOptionSchema
  .omit({ description: true })
  .extend({
    items: z.array(startingEquipmentItemSchema),
    wealth: characterWealthGrantSchema.optional(),
  })
  .refine((option) => option.items.length > 0 || option.wealth != null, {
    message: 'Starting equipment option must include items or be wealth-only',
  })

export type StartingEquipmentOption = z.infer<typeof startingEquipmentOptionSchema>

export const startingEquipmentChoiceSchema = contentChoiceSchema
  .extend({
    options: z.array(startingEquipmentOptionSchema).min(1),
  })
  .refine((choice) => choice.options.filter(isWealthOnlyStartingEquipmentOption).length <= 1, {
    message: 'At most one wealth-only (starting gold) option is allowed',
  })

export type StartingEquipmentChoice = z.infer<typeof startingEquipmentChoiceSchema>

export const characterCreationProficienciesSchema = z.object({
  skills: skillProficiencyChoiceGroupSchema.optional(),
  tools: toolProficiencyChoiceGroupSchema.optional(),
})

export type CharacterCreationProficiencies = z.infer<typeof characterCreationProficienciesSchema>

export const classCharacterCreationSchema = z
  .object({
    startingEquipment: startingEquipmentChoiceSchema.optional(),
    proficiencies: characterCreationProficienciesSchema.optional(),
    /** Authored picker recommendation rules where inference cannot reach (soft catalog references). */
    equipmentRecommendations: equipmentRecommendationsSchema.optional(),
  })
  .refine(
    (value) =>
      value.startingEquipment !== undefined ||
      value.proficiencies !== undefined ||
      value.equipmentRecommendations !== undefined,
    {
      message:
        'characterCreation requires startingEquipment, proficiencies, and/or equipmentRecommendations',
    },
  )

export type ClassCharacterCreation = z.infer<typeof classCharacterCreationSchema>

/** Resolves a bare equipment slug to the opaque catalog content id for a ruleset. */
export function resolveEquipmentContentId(rulesetId: string, equipmentSlug: string): string {
  return `${rulesetId}:${equipmentSlug}`
}
