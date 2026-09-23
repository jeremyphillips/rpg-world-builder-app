import { z } from 'zod'

import { authoredContentBodySchema } from '../../rpg/primitives/authored-content'
import { contentMediaSchema } from './content-media'
import { formatUntitledContentName } from '../../rpg/content/lib/draft-authored-content'

/**
 * Authored content body variant for media-enabled catalog domains.
 * Omits legacy `imageKey`; not yet composed into live type schemas until cutover.
 */
export const mediaBearingAuthoredContentBodySchema = authoredContentBodySchema.extend({
  media: contentMediaSchema.optional(),
})

export type MediaBearingAuthoredContentBody = z.infer<typeof mediaBearingAuthoredContentBodySchema>

/** Draft counterpart used by the six media-enabled authoring domains. */
export function mediaBearingDraftAuthoredContentBodySchema(label: string) {
  return mediaBearingAuthoredContentBodySchema
    .extend({
      name: z
        .string()
        .transform((value) => (value.trim() ? value : formatUntitledContentName(label)))
        .pipe(z.string().min(1)),
    })
    .describe(`Draft ${label} body with managed media.`)
}
