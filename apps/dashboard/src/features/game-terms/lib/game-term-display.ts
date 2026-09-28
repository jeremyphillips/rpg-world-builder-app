import {
  resolveContentDisplayImage,
  vocabularyOptionContentSource,
  vocabularySetSubject,
  type ContentDisplayFallback,
  type ContentDisplayImage,
  type ContentDisplaySurface,
  type VocabularyOption,
  type VocabularyOptionSetId,
} from '@rpg/contracts'

import { mediaImageUrl, MEDIA_SOURCE_CROP, systemContentImageUrl } from '@/features/media'

export type ResolveGameTermDisplayInput = {
  setId: VocabularyOptionSetId
  option: Pick<VocabularyOption, 'id' | 'source' | 'media'>
  rulesetId?: string
  surface: ContentDisplaySurface
  fallback?: ContentDisplayFallback
}

export type ResolveGameTermDisplayResult =
  | { outcome: 'image'; display: ContentDisplayImage }
  | { outcome: 'fallback'; fallback: ContentDisplayFallback }

function absolutizeDisplay(display: ContentDisplayImage): ContentDisplayImage {
  if (display.sourceKind === 'system') {
    return { ...display, src: systemContentImageUrl(display.src) }
  }
  return display
}

export function resolveGameTermDisplay(
  input: ResolveGameTermDisplayInput,
): ResolveGameTermDisplayResult {
  const result = resolveContentDisplayImage({
    media: input.option.media,
    surface: input.surface,
    domain: 'game-term',
    subject: vocabularySetSubject(input.setId),
    slug: input.option.id,
    contentSource: vocabularyOptionContentSource(input.option.source),
    rulesetId: input.rulesetId,
    resolveUploadSrc: (assetId) => mediaImageUrl(assetId, 'emblem', MEDIA_SOURCE_CROP),
  })

  if (result.outcome === 'image') {
    return { outcome: 'image', display: absolutizeDisplay(result.display) }
  }

  return {
    outcome: 'fallback',
    fallback: input.fallback ?? result.fallback,
  }
}

export function resolveGameTermDisplayImage(
  input: ResolveGameTermDisplayInput,
): ContentDisplayImage | undefined {
  const result = resolveGameTermDisplay(input)
  return result.outcome === 'image' ? result.display : undefined
}
