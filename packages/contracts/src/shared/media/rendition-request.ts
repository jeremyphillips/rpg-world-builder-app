import { z } from 'zod'

import { normalizedCropSchema } from './geometry'
import { mediaRenditionPresetSchema } from './rendition-preset'

export const mediaRenditionCropQuerySchema = normalizedCropSchema

export type MediaRenditionCropQuery = z.infer<typeof mediaRenditionCropQuerySchema>

export const mediaRenditionRequestParamsSchema = z
  .object({
    assetId: z.string().min(1),
    preset: mediaRenditionPresetSchema,
  })
  .strict()

export type MediaRenditionRequestParams = z.infer<typeof mediaRenditionRequestParamsSchema>

export const MEDIA_RENDITION_CROP_QUERY_KEYS = {
  x: 'cropX',
  y: 'cropY',
  width: 'cropWidth',
  height: 'cropHeight',
} as const

export function parseMediaRenditionCropQuery(
  query: Record<string, unknown>,
): MediaRenditionCropQuery | undefined {
  const x = query[MEDIA_RENDITION_CROP_QUERY_KEYS.x]
  const y = query[MEDIA_RENDITION_CROP_QUERY_KEYS.y]
  const width = query[MEDIA_RENDITION_CROP_QUERY_KEYS.width]
  const height = query[MEDIA_RENDITION_CROP_QUERY_KEYS.height]

  if (x === undefined && y === undefined && width === undefined && height === undefined) {
    return undefined
  }

  const parsed = mediaRenditionCropQuerySchema.safeParse({
    x: Number(x),
    y: Number(y),
    width: Number(width),
    height: Number(height),
  })

  return parsed.success ? parsed.data : undefined
}
