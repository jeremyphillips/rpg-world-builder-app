import { z } from 'zod'

import { CONTENT_MEDIA_MAX_ATTACHMENTS, CONTENT_MEDIA_MAX_UPLOADS_IN_FLIGHT } from './limits'
import { mediaAssetSchema } from './asset'

/** Same-origin base path for the media upload API. */
export const MEDIA_API_PATH = '/api/media'

/** Multer field name for single-file media asset uploads. */
export const MEDIA_UPLOAD_FORM_FIELD = 'file'

/** Optional idempotency header for media asset uploads. */
export const MEDIA_UPLOAD_IDEMPOTENCY_HEADER = 'Idempotency-Key'

export const mediaScopeSchema = z.discriminatedUnion('kind', [
  z
    .object({
      kind: z.literal('campaign-content'),
      campaignId: z.string().min(1),
    })
    .strict(),
  z
    .object({
      kind: z.literal('campaign-npc'),
      campaignId: z.string().min(1),
    })
    .strict(),
  z
    .object({
      kind: z.literal('user-pc'),
      userId: z.string().min(1),
    })
    .strict(),
])

export type MediaScope = z.infer<typeof mediaScopeSchema>

export const createMediaUploadSessionInputSchema = z
  .object({
    scope: mediaScopeSchema,
  })
  .strict()

export type CreateMediaUploadSessionInput = z.infer<typeof createMediaUploadSessionInputSchema>

export const mediaUploadSessionSchema = z
  .object({
    id: z.string().min(1),
    scope: mediaScopeSchema,
    expiresAt: z.string().datetime(),
    maxUploadBytes: z.number().int().positive(),
    maxAttachments: z.literal(CONTENT_MEDIA_MAX_ATTACHMENTS),
    maxUploadsInFlight: z.literal(CONTENT_MEDIA_MAX_UPLOADS_IN_FLIGHT),
    createdAt: z.string().datetime(),
  })
  .strict()

export type MediaUploadSession = z.infer<typeof mediaUploadSessionSchema>

export const mediaAssetUploadResponseSchema = z
  .object({
    sessionId: z.string().min(1),
    asset: mediaAssetSchema,
  })
  .strict()

export type MediaAssetUploadResponse = z.infer<typeof mediaAssetUploadResponseSchema>
