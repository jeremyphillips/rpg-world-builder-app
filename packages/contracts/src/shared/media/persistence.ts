import { z } from 'zod'

import { contentMediaSchema } from './content-media'

/** How a media manager applies changes to its host surface. */
export const mediaPersistenceModeSchema = z.enum(['apply-to-draft', 'commit-record'])

export type MediaPersistenceMode = z.infer<typeof mediaPersistenceModeSchema>

/**
 * Domain media write semantics:
 * - `media` omitted → unchanged / inherit overlay base as applicable
 * - `media` supplied → replace the full gallery and role map
 * - explicit empty media → remove all effective media
 */
export const contentMediaWriteInputSchema = z
  .object({
    mode: mediaPersistenceModeSchema,
    media: contentMediaSchema.optional(),
    expectedMediaRevision: z.number().int().nonnegative().optional(),
  })
  .strict()

export type ContentMediaWriteInput = z.infer<typeof contentMediaWriteInputSchema>

/** Result of applying validated media to a parent form draft (modal Save). */
export type ApplyContentMediaToDraftResult =
  | { ok: true; media: z.infer<typeof contentMediaSchema>; dirty: true }
  | { ok: false; reason: 'validation_failed'; issues: readonly { message: string }[] }

/** Result of committing media to a saved record (detail Save / domain command). */
export type CommitContentMediaRecordResult =
  | { ok: true; media: z.infer<typeof contentMediaSchema> }
  | {
      ok: false
      reason: 'stale_revision' | 'validation_failed'
      media?: z.infer<typeof contentMediaSchema>
    }
