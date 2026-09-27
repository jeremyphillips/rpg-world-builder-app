import type {
  ContentDisplayFallback,
  ContentDisplayImage,
  ContentDisplaySurface,
  VocabularyOption,
} from '@rpg/contracts'

import { resolveGameTermDisplay } from '@/features/game-terms'

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

  const result = resolveGameTermDisplay({
    setId: 'spell-schools',
    option,
    rulesetId: input.rulesetId,
    surface: input.surface,
    fallback,
  })

  if (result.outcome === 'image') {
    return { displayImage: result.display, fallback }
  }

  return { fallback: result.fallback }
}
