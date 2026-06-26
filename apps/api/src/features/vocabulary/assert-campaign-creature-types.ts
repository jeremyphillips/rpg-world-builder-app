import { CREATURE_TYPE_SET_ID, activeVocabularyOptionIds } from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import { resolveVocabularySetForCampaign } from './vocabulary.service'

/** Active creature type ids for a campaign's resolved vocabulary set. */
export async function getActiveCreatureTypeIdsForCampaign(
  campaignId: string,
): Promise<ReadonlySet<string>> {
  const set = await resolveVocabularySetForCampaign(campaignId, CREATURE_TYPE_SET_ID)
  return activeVocabularyOptionIds(set)
}

/** Rejects ids that are missing or disabled in the campaign vocabulary. */
export async function assertCreatureTypesActiveInCampaign(
  campaignId: string,
  ids: readonly string[],
): Promise<void> {
  if (ids.length === 0) return

  const activeIds = await getActiveCreatureTypeIdsForCampaign(campaignId)
  const invalid = ids.filter((id) => !activeIds.has(id))
  if (invalid.length > 0) {
    throw new HttpError(
      400,
      'invalid_vocabulary',
      `Unknown or disabled creature type: ${invalid.join(', ')}.`,
    )
  }
}
