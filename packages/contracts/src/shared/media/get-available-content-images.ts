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
  deriveSystemClassPrimarySource,
  resolveContentImageSet,
  resolveSystemContentImage,
  SYSTEM_CLASS_PRIMARY_SOURCE_DIMENSIONS,
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

  const derived = deriveSystemClassPrimarySource({
    imageSetId: resolvedImageSetId,
    slug: input.slug,
  })
  if (!derived || input.contentSource !== 'system' || input.contentType !== 'classes') {
    return uploads
  }

  const srcPath = resolveSystemContentImage({
    imageSetId: derived.imageSetId,
    contentType: derived.contentType,
    assetRole: derived.assetRole,
    slug: derived.slug,
    contentSource: input.contentSource,
  })
  if (!srcPath) return uploads

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
    sourceDimensions: SYSTEM_CLASS_PRIMARY_SOURCE_DIMENSIONS,
  }

  return [...uploads, systemImage]
}
