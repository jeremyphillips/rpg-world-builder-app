import {
  getContentMediaPolicy,
  projectAvailableContentImages,
  resolveEffectiveRepresentativeImageId,
  type ContentMedia,
  type ContentMediaDomain,
} from '@rpg/contracts'
import type { MediaFieldSummaryItem } from '@rpg/ui'

import { mediaImageUrl, MEDIA_SOURCE_CROP, systemContentImageUrl } from './media-display'
import { resolveMediaFieldCapacity, type MediaFieldConfig } from './media-field-config'
import type { MediaManagerContentContext } from './media-manager.types'
import { resolveMediaContentAvailability } from './resolve-media-content-availability.lib'

export type MediaFieldSummaryModel = {
  items: MediaFieldSummaryItem[]
  attachmentCount: number
  galleryCount: number
  representativeId: string | undefined
  maxItems: number
  contextStatus: 'complete' | 'incomplete'
}

export function buildMediaFieldSummaryModel(input: {
  config: MediaFieldConfig
  media: ContentMedia
  contentContext?: MediaManagerContentContext
}): MediaFieldSummaryModel {
  const { config, media, contentContext } = input
  const policy = getContentMediaPolicy(config.domain as ContentMediaDomain)
  const availability = resolveMediaContentAvailability({
    media,
    domain: config.domain as ContentMediaDomain,
    contentContext,
  })
  const availableImages = projectAvailableContentImages(availability.sources)
  const systemImage = availableImages.find((image) => image.kind === 'system')
  const representativeId = resolveEffectiveRepresentativeImageId(
    media,
    policy.representativeRoles,
    availability.sources,
  )
  const maxItems = resolveMediaFieldCapacity(config)
  const items: MediaFieldSummaryItem[] = [
    ...media.images.map((image) => ({
      id: image.id,
      alt: image.alt,
      src: mediaImageUrl(image.assetId, 'gallery-thumbnail', MEDIA_SOURCE_CROP),
    })),
    ...(systemImage
      ? [
          {
            id: systemImage.id,
            alt: `System ${systemImage.source.slug}`,
            src: systemContentImageUrl(systemImage.srcPath),
          },
        ]
      : []),
  ]

  return {
    items,
    attachmentCount: media.images.length,
    galleryCount: items.length,
    representativeId,
    maxItems,
    contextStatus: availability.contextStatus,
  }
}
