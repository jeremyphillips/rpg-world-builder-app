import { z } from 'zod'

import { contentPatchBaseSchema } from '../envelope'
import { storedOverlaySchema } from './stored'

/** Mongo/API patch row: campaign + target + versioned `StoredOverlay` payload. */
export const contentStoredOverlayPatchSchema = contentPatchBaseSchema.extend({
  patch: storedOverlaySchema,
})

export type ContentStoredOverlayPatch = z.infer<typeof contentStoredOverlayPatchSchema>
