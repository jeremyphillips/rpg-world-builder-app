import {
  resolveContentDisplayImageAsOptional,
  type ApiContentTypeKey,
  type ContentDisplayImage,
  type ContentMedia,
  type ContentSource,
  type ContentTypeKey,
  type ContentMediaDomain,
} from '@rpg/contracts'

import { resolveMediaAssetUrl } from '../../media/lib/resolve-media-asset-url.lib'

const MEDIA_SOURCE_CROP = { x: 0, y: 0, width: 1, height: 1 } as const

const SEARCH_CONTENT_TYPE_MEDIA_DOMAIN: Partial<Record<ApiContentTypeKey, ContentMediaDomain>> = {
  classes: 'class',
  species: 'species',
  equipment: 'equipment',
  locations: 'location',
  organizations: 'organization',
}

export function resolveGlobalSearchContentDisplayImage(input: {
  contentType: ApiContentTypeKey
  media?: ContentMedia | null
  slug: string
  contentSource: ContentSource
  rulesetId?: string
  campaignImageSetId?: string
}): ContentDisplayImage | undefined {
  const domain = SEARCH_CONTENT_TYPE_MEDIA_DOMAIN[input.contentType]
  if (!domain) {
    return undefined
  }

  return resolveContentDisplayImageAsOptional({
    media: input.media,
    surface: 'compact',
    domain,
    contentType: input.contentType as ContentTypeKey,
    slug: input.slug,
    contentSource: input.contentSource,
    rulesetId: input.rulesetId,
    campaignImageSetId: input.campaignImageSetId,
    resolveUploadSrc: (assetId) => resolveMediaAssetUrl(assetId, 'artwork', MEDIA_SOURCE_CROP),
  })
}
