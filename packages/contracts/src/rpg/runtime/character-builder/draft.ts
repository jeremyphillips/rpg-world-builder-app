import { z } from 'zod'

import { abilitySchema } from '../../vocab/ability'
import { optionalAlignmentSchema } from '../../vocab/alignment'
import { characterNarrativeSchema } from '../character/narrative'
import { abilityGenerationMethodSchema } from './ability-generation'
import { characterBuilderStepIdSchema } from './step-ids'

// ---------------------------------------------------------------------------
// CharacterBuilderDraft — the temporary workflow object. Allowed to represent
// incomplete choices; step/phase validators (validate.ts, BENCH-080) decide
// what blocks. Persisted to sessionStorage wrapped in
// PersistedCharacterBuilderState; content is referenced by id only — never
// store catalog-derived data, previews, or validation results here.
// ---------------------------------------------------------------------------

export const characterBuilderDraftIdentitySchema = z.object({
  name: z.string().optional(),
  narrative: characterNarrativeSchema.optional(),
  imageKey: z.string().optional(),
  alignment: optionalAlignmentSchema,
})

export type CharacterBuilderDraftIdentity = z.infer<typeof characterBuilderDraftIdentitySchema>

export const characterBuilderDraftSpeciesSchema = z.object({
  speciesId: z.string().min(1).optional(),
  heritageId: z.string().min(1).optional(),
})

export type CharacterBuilderDraftSpecies = z.infer<typeof characterBuilderDraftSpeciesSchema>

export const characterBuilderDraftClassSchema = z.object({
  classId: z.string().min(1).optional(),
  /** MVP builds level-1 characters only; the level-up wizard owns progression. */
  level: z.literal(1),
})

export type CharacterBuilderDraftClass = z.infer<typeof characterBuilderDraftClassSchema>

export const characterBuilderDraftAbilitiesSchema = z.object({
  method: abilityGenerationMethodSchema.optional(),
  /**
   * Final scores per ability, however generated. When method is
   * 'standard-array', finalSubmit validation enforces the exact multiset.
   * Bounds are validation-phase concerns — partial typing must not drop drafts.
   */
  scores: z.partialRecord(abilitySchema, z.number().int()).optional(),
})

export type CharacterBuilderDraftAbilities = z.infer<typeof characterBuilderDraftAbilitiesSchema>

export const characterBuilderDraftEquipmentModeSchema = z.enum(['package', 'gold'])

export type CharacterBuilderDraftEquipmentMode = z.infer<
  typeof characterBuilderDraftEquipmentModeSchema
>

export const characterBuilderDraftEquipmentPurchaseSourceModeSchema = z.enum([
  'startingGold',
  'manual',
])

export type CharacterBuilderDraftEquipmentPurchaseSourceMode = z.infer<
  typeof characterBuilderDraftEquipmentPurchaseSourceModeSchema
>

export const characterBuilderDraftEquipmentPurchaseSchema = z.object({
  equipmentId: z.string().min(1),
  quantity: z.number().int().min(1),
  /** Stamped when the purchase is added; never reinterpreted from mode or catalog. */
  sourceMode: characterBuilderDraftEquipmentPurchaseSourceModeSchema,
})

export type CharacterBuilderDraftEquipmentPurchase = z.infer<
  typeof characterBuilderDraftEquipmentPurchaseSchema
>

export const characterBuilderDraftEquipmentSchema = z.object({
  mode: characterBuilderDraftEquipmentModeSchema,
  purchases: z.array(characterBuilderDraftEquipmentPurchaseSchema).default([]),
  /**
   * Package slot keys `${classId}:${optionId}:${itemIndex}` removed from the
   * selected starting package (index into option `items[]`, not equipmentId).
   */
  removedPackageItemKeys: z.array(z.string().min(1)).default([]),
  customized: z.boolean().default(false),
})

export type CharacterBuilderDraftEquipment = z.infer<typeof characterBuilderDraftEquipmentSchema>

export const characterBuilderDraftSchema = z.object({
  identity: characterBuilderDraftIdentitySchema,
  species: characterBuilderDraftSpeciesSchema,
  class: characterBuilderDraftClassSchema,
  abilities: characterBuilderDraftAbilitiesSchema,
  /**
   * All pending-choice picks (proficiencies, equipment, spells, traits),
   * keyed by deterministic ChoiceSet id (choice-set.ts, BENCH-078).
   */
  choiceSelections: z.record(z.string(), z.array(z.string().min(1))),
  /** Equipment decisions only — inventory and wealth are derived at finalize. */
  equipment: characterBuilderDraftEquipmentSchema.optional(),
  currentStepId: characterBuilderStepIdSchema.optional(),
  touchedStepIds: z.array(characterBuilderStepIdSchema),
})

export type CharacterBuilderDraft = z.infer<typeof characterBuilderDraftSchema>

export function createEmptyCharacterBuilderDraft(): CharacterBuilderDraft {
  return {
    identity: {},
    species: {},
    class: { level: 1 },
    abilities: {},
    choiceSelections: {},
    touchedStepIds: [],
  }
}

// ---------------------------------------------------------------------------
// Persistence wrapper — bump the version on any breaking draft shape change;
// rehydration drops mismatched or unparseable state instead of migrating.
// ---------------------------------------------------------------------------

export const CHARACTER_BUILDER_DRAFT_VERSION = 2

export const persistedCharacterBuilderStateSchema = z.object({
  version: z.literal(CHARACTER_BUILDER_DRAFT_VERSION),
  draft: characterBuilderDraftSchema,
})

export type PersistedCharacterBuilderState = z.infer<typeof persistedCharacterBuilderStateSchema>

export function createPersistedCharacterBuilderState(
  draft: CharacterBuilderDraft,
): PersistedCharacterBuilderState {
  return { version: CHARACTER_BUILDER_DRAFT_VERSION, draft }
}

/** Safe rehydrate: returns the draft, or null for garbage / version mismatch. */
export function parsePersistedCharacterBuilderState(raw: unknown): CharacterBuilderDraft | null {
  const result = persistedCharacterBuilderStateSchema.safeParse(raw)
  return result.success ? result.data.draft : null
}
