import { z } from 'zod'

import { characterBuilderStepIdSchema } from './step-ids'

// ---------------------------------------------------------------------------
// Character build validation issue — serializable builder contract for API wire payloads.
// ---------------------------------------------------------------------------

export const characterBuildValidationIssueSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  path: z.string().optional(),
  stepId: characterBuilderStepIdSchema.optional(),
  choiceSetId: z.string().optional(),
  allowanceId: z.string().optional(),
})

export type CharacterBuildValidationIssue = z.infer<typeof characterBuildValidationIssueSchema>
