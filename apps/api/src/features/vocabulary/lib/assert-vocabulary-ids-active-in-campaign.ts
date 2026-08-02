import { activeVocabularyOptionIds, type VocabularyOptionSetId } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import {
  resolveVocabularySetForCampaign,
  vocabularyUsageContextForCampaign,
} from '../sets/vocabulary.service'
import { runVocabularyValidationAdapter } from './vocabulary-validation-adapters'

/** Rejects ids missing or disabled in the campaign-resolved vocabulary set. */
export async function assertVocabularyIdsActiveInCampaign(
  campaignId: string,
  setId: VocabularyOptionSetId,
  ids: readonly string[],
): Promise<void> {
  if (ids.length === 0) return

  const set = await resolveVocabularySetForCampaign(
    vocabularyUsageContextForCampaign(campaignId),
    setId,
  )
  const activeIds = activeVocabularyOptionIds(set)
  const invalid = ids.filter((id) => !activeIds.has(id))

  if (invalid.length > 0) {
    throw new HttpError(
      400,
      'invalid_vocabulary',
      `Unknown or disabled vocabulary option: ${invalid.join(', ')}.`,
    )
  }

  await runVocabularyValidationAdapter(campaignId, setId, ids)
}
