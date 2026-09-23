import type { z } from 'zod'

import { authoredContentBodySchema } from '../../rpg/primitives/authored-content'
import { contentMediaSchema } from './content-media'

/**
 * Authored content body variant for media-enabled catalog domains.
 * Omits legacy `imageKey`; not yet composed into live type schemas until cutover.
 */
export const mediaBearingAuthoredContentBodySchema = authoredContentBodySchema
  .omit({ imageKey: true })
  .extend({
    media: contentMediaSchema.optional(),
  })
  .strict()

export type MediaBearingAuthoredContentBody = z.infer<typeof mediaBearingAuthoredContentBodySchema>
