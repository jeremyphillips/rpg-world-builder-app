import { z } from 'zod'

import { contentTypeKeySchema } from '../content/content-type-keys'
import { catalogLayerSchema } from '../../vocab/catalog-layer'

export const contentLineageSchema = z.discriminatedUnion('relation', [
  z.object({
    relation: z.literal('duplicate'),
    contentId: z.string().min(1),
    contentTypeKey: contentTypeKeySchema,
    catalogLayer: catalogLayerSchema,
    at: z.iso.datetime(),
  }),
])

export type ContentLineage = z.infer<typeof contentLineageSchema>
