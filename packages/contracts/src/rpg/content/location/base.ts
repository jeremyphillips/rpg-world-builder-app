import { z } from 'zod'

import { contentBodyBaseSchema } from '../lib/envelope'

/**
 * Shared body fields present on every location union variant.
 *
 * Images use the existing `imageKey` on the authored-content body base.
 * Future map metadata (`map?: LocationMap`) can extend this schema when grid
 * maps land — keep maps decoupled from the kind taxonomy.
 *
 * Non-containment graph links (`connected_to`, `entrance_to`, `portal_to`) are
 * reserved for a separate relationship layer; never model them as parent/child.
 */
export const locationBaseSchema = contentBodyBaseSchema.extend({
  parentLocationId: z.string().min(1).optional(),
})

export type LocationBaseFields = z.infer<typeof locationBaseSchema>
