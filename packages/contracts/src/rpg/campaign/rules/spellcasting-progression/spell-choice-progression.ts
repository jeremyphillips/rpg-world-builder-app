import { z } from 'zod'

import { progressionExtensionSchema } from '../../../vocab/spell/progression-extension'
import { spellChoiceProgressionKindSchema } from '../../../vocab/spell/spell-choice-progression-kind'
import { spellChoiceSourceSchema } from '../../../vocab/spell/spell-choice-source'
import { spellCollectionKindSchema } from '../../../vocab/spell/spell-collection-kind'
import { spellMutationPolicySchema } from '../../../vocab/spell/spell-mutation-policy'

import { progressionCurveSchema } from './progression-curve'

// ---------------------------------------------------------------------------
// Spell choice progression — capacity or gain curve with source/destination.
// ---------------------------------------------------------------------------

export const spellChoiceProgressionPresentationSchema = z
  .object({
    column: z
      .object({
        enabled: z.boolean(),
        label: z.string().min(1),
      })
      .optional(),
  })
  .optional()

export type SpellChoiceProgressionPresentation = z.infer<
  typeof spellChoiceProgressionPresentationSchema
>

export const spellChoiceProgressionSchema = z.object({
  id: z.string().min(1),
  kind: spellChoiceProgressionKindSchema,
  curve: progressionCurveSchema,
  extension: progressionExtensionSchema,
  source: spellChoiceSourceSchema,
  destination: spellCollectionKindSchema,
  mutation: spellMutationPolicySchema,
  presentation: spellChoiceProgressionPresentationSchema,
})

export type SpellChoiceProgression = z.infer<typeof spellChoiceProgressionSchema>
