import { z } from 'zod'

// ---------------------------------------------------------------------------
// Builder step vocabulary — logical wizard sections, not persisted models.
// BuilderStep orchestration metadata (status, dependencies) builds on these
// ids in steps.ts (BENCH-078).
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
