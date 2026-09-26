import { z } from 'zod'

import { contentMediaSchema } from '../../campaign/campaign-media.lib'

// ---------------------------------------------------------------------------
// Character media patch — detail-mode MediaManager writes.
// ---------------------------------------------------------------------------

export const characterMediaPatchInputSchema = z.object({
  media: contentMediaSchema,
  expectedMediaRevision: z.number().int().min(0),
})

export type CharacterMediaPatchInput = z.infer<typeof characterMediaPatchInputSchema>
