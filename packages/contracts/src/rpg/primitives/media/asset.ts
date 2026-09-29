import { z } from 'zod'

/** Client-safe asset lifecycle states exposed by the media API. */
export const mediaAssetLifecycleSchema = z.enum(['ready', 'expired', 'deleting'])

export type MediaAssetLifecycle = z.infer<typeof mediaAssetLifecycleSchema>

/** Asset metadata returned to clients — no storage keys or ownership internals. */
export const mediaAssetSchema = z
  .object({
    id: z.string().min(1),
    filename: z.string().min(1),
    mimeType: z.string().min(1),
    byteSize: z.number().int().nonnegative(),
    orientedWidth: z.number().int().positive(),
    orientedHeight: z.number().int().positive(),
    contentHash: z.string().min(1),
    animated: z.boolean(),
    lifecycle: mediaAssetLifecycleSchema,
    createdAt: z.string().datetime(),
  })
  .strict()

export type MediaAsset = z.infer<typeof mediaAssetSchema>

/** Trusted dimensions supplied to gallery validation (typically from asset records). */
export const mediaAssetDimensionsSchema = z.object({
  orientedWidth: z.number().int().positive(),
  orientedHeight: z.number().int().positive(),
})

export type MediaAssetDimensions = z.infer<typeof mediaAssetDimensionsSchema>
