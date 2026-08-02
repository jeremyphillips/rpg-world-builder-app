import type { GlobalSearchDocument, GlobalSearchField } from '@rpg/contracts'
import { getGlobalSearchFilterGroupTypeLabel, getVocabularyOptionSetTerm } from '@rpg/contracts'

import {
  listResolvedVocabularySetsForCampaign,
  vocabularyUsageContextForCampaign,
} from '../../vocabulary/sets/vocabulary.service'
import { resolveVocabularyOptionsForViewer } from '../../vocabulary/lib/resolve-vocabulary-options-for-viewer'
import type { SearchSource } from '../lib/search-source.types'

function labelField(text: string): GlobalSearchField {
  return { text, weight: 1, role: 'label' }
}

function descriptionField(text: string | undefined): GlobalSearchField | undefined {
  const trimmed = text?.trim()
  if (!trimmed) return undefined
  return { text: trimmed, weight: 0.35, role: 'description' }
}

function groupField(text: string): GlobalSearchField {
  return { text, weight: 0.25, role: 'group' }
}

const GAME_TERM_TYPE_LABEL = getGlobalSearchFilterGroupTypeLabel('game-terms')

export const gameTermsSearchSource: SearchSource = {
  id: 'game-terms',
  async collect(ctx) {
    const vocabularyContext = vocabularyUsageContextForCampaign(ctx.campaignId)
    const sets = await listResolvedVocabularySetsForCampaign(vocabularyContext)
    const documents: GlobalSearchDocument[] = []

    for (const set of sets) {
      const setLabel = getVocabularyOptionSetTerm(set.id).label
      const searchableOptions = resolveVocabularyOptionsForViewer(set.options, ctx.viewerRole)

      for (const option of searchableOptions) {
        const fields = [
          labelField(option.label),
          descriptionField(option.description),
          groupField(setLabel),
        ].filter((field): field is GlobalSearchField => field !== undefined)

        documents.push({
          id: `game-term:${set.id}:${option.id}`,
          filterGroup: 'game-terms',
          typeLabel: GAME_TERM_TYPE_LABEL,
          title: option.label,
          secondary: setLabel,
          target: {
            kind: 'game-term',
            setId: set.id,
            termId: option.id,
          },
          fields,
          ...(option.status === 'disabled' ? { campaignAvailable: false as const } : {}),
        })
      }
    }

    return documents
  },
}
