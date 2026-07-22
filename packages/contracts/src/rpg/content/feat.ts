import { z } from 'zod'

import { featCategorySchema } from '../vocab/feat'
import { FEAT_CONTENT_TYPE_TERM } from './lib/content-type-terms'
import { createDraftInputSchema, createPublishInputSchema } from './lib/content-input-schemas'
import { draftAuthoredContentBodySchema } from './lib/draft-authored-content'
import { contentBodyBaseSchema, contentMetaSchema, contentPatchBaseSchema } from './lib/envelope'
import { requirementExpressionSchema } from './lib/requirement-expression'
import { featValidationMessages } from './feat-messages'

// ---------------------------------------------------------------------------
// Feat — prose-first catalog content. Benefit prose lives in `description` for
// v1; structured `benefit.sections` is reserved for a future phase. Eligibility
// uses composable RequirementExpression trees.
// ---------------------------------------------------------------------------

export const featRepeatableSchema = z
  .object({
    allowed: z.boolean(),
    /** Rich-text HTML repeat constraints. Only when `allowed` is true. */
    notes: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (!val.allowed && val.notes !== undefined) {
      ctx.addIssue({
        code: 'custom',
        message: featValidationMessages.repeatableNotesOnlyWhenAllowed(),
        path: ['notes'],
      })
    }
  })

export type FeatRepeatable = z.infer<typeof featRepeatableSchema>

/** Reserved — named sub-benefits (Initiative Proficiency, etc.). v1 uses `description`. */
export const featBenefitSectionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
})

export const featBenefitSchema = z.object({
  sections: z.array(featBenefitSectionSchema).min(1),
})

export type FeatBenefit = z.infer<typeof featBenefitSchema>

/** The editable shape: what a form authors and what a patch overrides. */
export const featBodySchema = contentBodyBaseSchema.extend({
  category: featCategorySchema,
  prerequisite: requirementExpressionSchema.optional(),
  repeatable: featRepeatableSchema.default({ allowed: false }),
  /** v1: omit on all records; benefit prose lives in `description`. */
  benefit: featBenefitSchema.optional(),
})

export type FeatBody = z.infer<typeof featBodySchema>

/** Draft save body — untitled name fallback; category optional. */
export const featBodyDraftSchema = draftAuthoredContentBodySchema(
  FEAT_CONTENT_TYPE_TERM.label,
).extend({
  category: featCategorySchema.optional(),
  prerequisite: requirementExpressionSchema.optional(),
  repeatable: featRepeatableSchema.default({ allowed: false }),
  benefit: featBenefitSchema.optional(),
})

export type FeatBodyDraft = z.infer<typeof featBodyDraftSchema>

/** Stored shape = ownership envelope + body. */
export const featSchema = contentMetaSchema.extend(featBodySchema.shape)
export type Feat = z.infer<typeof featSchema>

/** Stored draft shape — relaxed body fields for in-progress homebrew. */
export const featDraftStoredSchema = contentMetaSchema.extend(featBodyDraftSchema.shape)
export type FeatDraft = z.infer<typeof featDraftStoredSchema>

export const createFeatInputSchema = createPublishInputSchema(featBodySchema)
export type CreateFeatInput = z.infer<typeof createFeatInputSchema>

export const createFeatDraftInputSchema = createDraftInputSchema(featBodyDraftSchema)
export type CreateFeatDraftInput = z.infer<typeof createFeatDraftInputSchema>

export const updateFeatInputSchema = createFeatInputSchema.partial()
export type UpdateFeatInput = z.infer<typeof updateFeatInputSchema>

export const updateFeatDraftInputSchema = createFeatDraftInputSchema.partial()
export type UpdateFeatDraftInput = z.infer<typeof updateFeatDraftInputSchema>

export const featPatchSchema = contentPatchBaseSchema.extend({
  patch: featBodySchema.partial(),
})
export type FeatPatch = z.infer<typeof featPatchSchema>
