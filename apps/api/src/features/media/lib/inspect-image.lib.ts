import sharp from 'sharp'

import { CONTENT_MEDIA_MAX_EDGE_PX, CONTENT_MEDIA_MAX_PIXEL_COUNT } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'

export type InspectedImage = {
  mimeType: string
  orientedWidth: number
  orientedHeight: number
  animated: boolean
}

const EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

export function extensionForMime(mimeType: string): string {
  const ext = EXTENSION_MAP[mimeType]
  if (!ext) {
    throw HttpError.badRequest('Unsupported file type. Accepted types: JPEG, PNG, WebP, GIF.')
  }
  return ext
}

/** Decode raster metadata using auto-orientation and enforce v1 pixel limits. */
export async function inspectImageBuffer(
  buffer: Buffer,
  mimeType: string,
): Promise<InspectedImage> {
  const pipeline = sharp(buffer, { animated: false, failOn: 'error' }).rotate()

  const metadata = await pipeline.metadata()
  const orientedWidth = metadata.width
  const orientedHeight = metadata.height

  if (!orientedWidth || !orientedHeight) {
    throw HttpError.badRequest('Could not decode image dimensions.')
  }

  const pixelCount = orientedWidth * orientedHeight
  if (pixelCount > CONTENT_MEDIA_MAX_PIXEL_COUNT) {
    throw HttpError.badRequest('Image exceeds the maximum allowed pixel count.')
  }

  if (orientedWidth > CONTENT_MEDIA_MAX_EDGE_PX || orientedHeight > CONTENT_MEDIA_MAX_EDGE_PX) {
    throw HttpError.badRequest('Image exceeds the maximum allowed edge length.')
  }

  const animated =
    mimeType === 'image/gif'
      ? (metadata.pages ?? 1) > 1
      : mimeType === 'image/webp'
        ? metadata.pages !== undefined && metadata.pages > 1
        : false

  // Ensure the buffer decodes successfully (first frame for animated sources).
  await pipeline.toBuffer()

  return {
    mimeType,
    orientedWidth,
    orientedHeight,
    animated,
  }
}
