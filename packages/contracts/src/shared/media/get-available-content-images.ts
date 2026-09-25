import type { ContentSource } from '../../rpg/content/lib/envelope'
import type { ContentTypeKey } from '../../rpg/primitives/content/content-type-keys'
import type { ContentMedia } from './content-media'
import {
  buildSystemContentImageVirtualId,
  createSystemRoleAssignment,
  type ContentMediaSystemSource,
} from './content-media-source'
import type { SourceDimensions } from './geometry'
import {
  deriveSystemContentImage,
  resolveContentImageSet,
  resolveSystemContentImage,
} from './system-content-image-registry'

export type AvailableContentUploadImage = {
  kind: 'upload'
  id: string
  attachment: ContentMedia['images'][number]
}

export type AvailableContentSystemImage = {
  kind: 'system'
  id: string
  source: ContentMediaSystemSource
  srcPath: string
  sourceDimensions: SourceDimensions
}

export type AvailableContentImage = AvailableContentUploadImage | AvailableContentSystemImage

export function getAvailableContentImages(input: {
  media: ContentMedia
  contentType: ContentTypeKey
  slug: string
  contentSource: ContentSource
  imageSetId?: string
  rulesetId?: string
}): AvailableContentImage[] {
  const resolvedImageSetId = resolveContentImageSet({
    campaignImageSetId: input.imageSetId,
    rulesetId: input.rulesetId,
  })
  const uploads: AvailableContentUploadImage[] = input.media.images.map((attachment) => ({
    kind: 'upload',
    id: attachment.id,
    attachment,
  }))

  if (input.contentSource !== 'system') {
    return uploads
  }

  const derived = deriveSystemContentImage({
    imageSetId: resolvedImageSetId,
    contentType: input.contentType,
    assetRole: 'primary',
    slug: input.slug,
  })
  if (!derived) {
    return uploads
  }

  const resolved = resolveSystemContentImage({
    imageSetId: derived.imageSetId,
    contentType: derived.contentType,
    assetRole: derived.assetRole,
    slug: derived.slug,
    contentSource: input.contentSource,
  })
  if (!resolved) return uploads

  const srcPath = resolved.path
  const sourceDimensions = resolved.sourceDimensions

  const source = createSystemRoleAssignment({
    imageSetId: derived.imageSetId,
    contentType: derived.contentType,
    assetRole: derived.assetRole,
    slug: derived.slug,
  }).source

  const systemImage: AvailableContentSystemImage = {
    kind: 'system',
    id: buildSystemContentImageVirtualId(source),
    source,
    srcPath,
    sourceDimensions,
  }

  return [...uploads, systemImage]
}
