import {
  resolveContentDisplayImageAsOptional,
  resolveContentMediaDomainForContentType,
  type ApiContentTypeKey,
  type ContentDisplayImage,
  type ContentMedia,
  type CatalogLayer,
  type ContentTypeKey,
  contentTypeSubject,
} from '@rpg/contracts'

import { resolveMediaArtworkUrl } from '../../media'

export function resolveGlobalSearchContentDisplayImage(input: {
  contentType: ApiContentTypeKey
  media?: ContentMedia | null
  slug: string
  catalogLayer: CatalogLayer
  rulesetId?: string
  campaignImageSetId?: string
}): ContentDisplayImage | undefined {
  const domain = resolveContentMediaDomainForContentType(input.contentType)
  if (!domain) {
    return undefined
  }

  return resolveContentDisplayImageAsOptional({
    media: input.media,
    surface: 'compact',
    domain,
    subject: contentTypeSubject(input.contentType as ContentTypeKey),
    slug: input.slug,
    catalogLayer: input.catalogLayer,
    rulesetId: input.rulesetId,
    campaignImageSetId: input.campaignImageSetId,
    resolveUploadSrc: resolveMediaArtworkUrl,
  })
}
