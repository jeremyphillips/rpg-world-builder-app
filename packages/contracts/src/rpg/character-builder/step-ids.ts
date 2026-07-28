import { z } from 'zod'

// ---------------------------------------------------------------------------
// Builder step vocabulary — logical wizard sections, not persisted models.
// Boundary-neutral contract shared by campaign wire schemas and runtime orchestration.
// ---------------------------------------------------------------------------

export const CHARACTER_BUILDER_STEP_IDS = [
  'identity',
  'species',
  'class',
  'abilities',
  'proficiencies',
  'equipment',
  'spells',
  'review',
] as const

export const characterBuilderStepIdSchema = z.enum(CHARACTER_BUILDER_STEP_IDS)

export type CharacterBuilderStepId = z.infer<typeof characterBuilderStepIdSchema>
