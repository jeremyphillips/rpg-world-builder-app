import { CREATURE_TYPE_SET_ID, activeVocabularyOptionIds } from '@rpg/contracts'

import {
  resolveVocabularySetForCampaign,
  vocabularyUsageContextForCampaign,
} from '../sets/vocabulary.service'
import { assertVocabularyIdsActiveInCampaign } from './assert-vocabulary-ids-active-in-campaign'

/** Active creature type ids for a campaign's resolved vocabulary set. */
export async function getActiveCreatureTypeIdsForCampaign(
  campaignId: string,
): Promise<ReadonlySet<string>> {
  const set = await resolveVocabularySetForCampaign(
    vocabularyUsageContextForCampaign(campaignId),
    CREATURE_TYPE_SET_ID,
  )
  return activeVocabularyOptionIds(set)
}

/** Rejects ids that are missing or disabled in the campaign vocabulary. */
export async function assertCreatureTypesActiveInCampaign(
  campaignId: string,
  ids: readonly string[],
): Promise<void> {
  await assertVocabularyIdsActiveInCampaign(campaignId, CREATURE_TYPE_SET_ID, ids)
}
