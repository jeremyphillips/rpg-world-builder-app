import type { ContentDisplayImage, ContentMedia, ContentTypeKey } from '@rpg/contracts'

import { getContentDisplayImage } from '@/features/content'

import type { ContentFormCtx } from '../registry/content-form-registry'

export function resolveFormPreviewDisplayImage(input: {
  media: ContentMedia | undefined
  ctx: ContentFormCtx
  contentType: ContentTypeKey
  slug: string
}): ContentDisplayImage | undefined {
  const display = getContentDisplayImage({
    media: input.media,
    contentType: input.contentType,
    slug: input.slug,
    contentSource: input.ctx.entitySource ?? 'homebrew',
    rulesetId: input.ctx.rulesetId,
    role: 'primary',
  })

  if (display.sourceKind === 'fallback') return undefined
  return display
}
