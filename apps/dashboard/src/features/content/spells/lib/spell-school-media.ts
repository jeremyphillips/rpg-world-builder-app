import {
  resolveContentDisplayImage,
  vocabularyOptionContentSource,
  vocabularySetSubject,
  type ContentDisplayFallback,
  type ContentDisplayImage,
  type ContentDisplaySurface,
  type VocabularyOption,
} from '@rpg/contracts'

import {
  mediaImageUrl,
  MEDIA_SOURCE_CROP,
  systemContentImageUrl,
} from '@/features/media/lib/media-display'

export type SpellSchoolEntityMedia = {
  displayImage?: ContentDisplayImage
  fallback: ContentDisplayFallback
}

export function resolveSpellSchoolEntityMedia(input: {
  schoolId: string | undefined
  vocabulary: { optionById: Record<string, Pick<VocabularyOption, 'id' | 'source' | 'media'>> }
  rulesetId?: string
  surface: ContentDisplaySurface
}): SpellSchoolEntityMedia {
  const fallback: ContentDisplayFallback = 'spell'
  if (!input.schoolId) {
    return { fallback }
  }

  const option = input.vocabulary.optionById[input.schoolId]
  if (!option) {
    return { fallback }
  }

  const result = resolveContentDisplayImage({
    media: option.media,
    surface: input.surface,
    domain: 'game-term',
    subject: vocabularySetSubject('spell-schools'),
    slug: option.id,
    contentSource: vocabularyOptionContentSource(option.source),
    rulesetId: input.rulesetId,
    resolveUploadSrc: (assetId) => mediaImageUrl(assetId, 'emblem', MEDIA_SOURCE_CROP),
  })

  if (result.outcome !== 'image') {
    return { fallback: result.fallback === 'game-term' ? fallback : result.fallback }
  }

  const display =
    result.display.sourceKind === 'system'
      ? { ...result.display, src: systemContentImageUrl(result.display.src) }
      : result.display

  return { displayImage: display, fallback }
}
