import type { ContentSource } from '../../rpg/content/lib/envelope'
import type { ContentMedia } from './content-media'
import {
  buildSystemContentImageVirtualId,
  createSystemRoleAssignment,
  type ContentMediaSystemSource,
} from './content-media-source'
import type { SourceDimensions } from './geometry'
import { getContentMediaPolicy, type ContentMediaDomain } from './media-policy'
import type { MediaRole } from './roles'
import {
  deriveSystemContentImage,
  resolveContentImageSet,
  resolveSystemContentImage,
} from './system-content-image-registry'
import type { SystemImageSubject } from './system-image-subject'

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
  domain: ContentMediaDomain
  subject: SystemImageSubject
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

  const policy = getContentMediaPolicy(input.domain)
  const systemImages: AvailableContentSystemImage[] = []

  for (const assetRole of policy.allowedRoles as readonly MediaRole[]) {
    const derived = deriveSystemContentImage({
      imageSetId: resolvedImageSetId,
      subject: input.subject,
      assetRole,
      slug: input.slug,
    })
    if (!derived) continue

    const resolved = resolveSystemContentImage({
      imageSetId: derived.imageSetId,
      subject: derived.subject,
      assetRole: derived.assetRole,
      slug: derived.slug,
      contentSource: input.contentSource,
    })
    if (!resolved) continue

    const source = createSystemRoleAssignment({
      imageSetId: derived.imageSetId,
      subject: derived.subject,
      assetRole: derived.assetRole,
      slug: derived.slug,
    }).source

    systemImages.push({
      kind: 'system',
      id: buildSystemContentImageVirtualId(source),
      source,
      srcPath: resolved.path,
      sourceDimensions: resolved.sourceDimensions,
    })
  }

  return [...uploads, ...systemImages]
}
