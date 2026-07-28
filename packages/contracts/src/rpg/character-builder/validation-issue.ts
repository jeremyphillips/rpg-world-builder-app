import { z } from 'zod'

import { characterBuilderStepIdSchema } from './step-ids'

// ---------------------------------------------------------------------------
// Character build validation issue — serializable builder contract for API wire payloads.
// ---------------------------------------------------------------------------

const CHARACTER_BUILD_VALIDATION_ISSUE_SINGLE_TARGET_MESSAGE =
  'A character build validation issue may reference only one target.'

export const characterBuildValidationIssueSchema = z
  .object({
    code: z.string().min(1),
    message: z.string().min(1),
    path: z.string().optional(),
    stepId: characterBuilderStepIdSchema.optional(),
    choiceSetId: z.string().min(1).optional(),
    allowanceId: z.string().min(1).optional(),
  })
  .superRefine((issue, ctx) => {
    const referenceCount = [issue.stepId, issue.choiceSetId, issue.allowanceId].filter(
      (value) => value !== undefined,
    ).length

    if (referenceCount > 1) {
      ctx.addIssue({
        code: 'custom',
        message: CHARACTER_BUILD_VALIDATION_ISSUE_SINGLE_TARGET_MESSAGE,
      })
    }
  })

export type CharacterBuildValidationIssue = z.infer<typeof characterBuildValidationIssueSchema>
