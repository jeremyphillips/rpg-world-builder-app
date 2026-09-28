import type {
  ContentDisplayImage,
  ContentMedia,
  VocabularyOptionSetId,
  VocabularyOptionSource,
} from '@rpg/contracts'
import {
  resolveContentDisplayImageAsOptional,
  vocabularyOptionContentSource,
  vocabularySetSubject,
} from '@rpg/contracts'

import { resolveMediaArtworkUrl } from '../../media'

export function resolveGameTermDisplayImage(input: {
  setId: VocabularyOptionSetId
  optionId: string
  source: VocabularyOptionSource
  media?: ContentMedia | null
  rulesetId?: string
}): ContentDisplayImage | undefined {
  return resolveContentDisplayImageAsOptional({
    media: input.media,
    surface: 'compact',
    domain: 'game-term',
    subject: vocabularySetSubject(input.setId),
    slug: input.optionId,
    contentSource: vocabularyOptionContentSource(input.source),
    rulesetId: input.rulesetId,
    resolveUploadSrc: resolveMediaArtworkUrl,
  })
}
