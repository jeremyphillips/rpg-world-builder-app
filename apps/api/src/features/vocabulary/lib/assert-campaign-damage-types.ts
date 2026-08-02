import { DAMAGE_TYPE_SET_ID, SENSE_SET_ID, activeVocabularyOptionIds } from '@rpg/contracts'

import {
  resolveVocabularySetForCampaign,
  vocabularyUsageContextForCampaign,
} from '../sets/vocabulary.service'
import { assertVocabularyIdsActiveInCampaign } from './assert-vocabulary-ids-active-in-campaign'

/** Active damage type ids for a campaign's resolved vocabulary set. */
export async function getActiveDamageTypeIdsForCampaign(
  campaignId: string,
): Promise<ReadonlySet<string>> {
  const set = await resolveVocabularySetForCampaign(
    vocabularyUsageContextForCampaign(campaignId),
    DAMAGE_TYPE_SET_ID,
  )
  return activeVocabularyOptionIds(set)
}

/** Rejects ids that are missing or disabled in the campaign vocabulary. */
export async function assertDamageTypesActiveInCampaign(
  campaignId: string,
  ids: readonly string[],
): Promise<void> {
  await assertVocabularyIdsActiveInCampaign(campaignId, DAMAGE_TYPE_SET_ID, ids)
}

/** Active sense type ids for a campaign's resolved vocabulary set. */
export async function getActiveSenseIdsForCampaign(
  campaignId: string,
): Promise<ReadonlySet<string>> {
  const set = await resolveVocabularySetForCampaign(
    vocabularyUsageContextForCampaign(campaignId),
    SENSE_SET_ID,
  )
  return activeVocabularyOptionIds(set)
}

/** Rejects ids that are missing or disabled in the campaign vocabulary. */
export async function assertSensesActiveInCampaign(
  campaignId: string,
  ids: readonly string[],
): Promise<void> {
  await assertVocabularyIdsActiveInCampaign(campaignId, SENSE_SET_ID, ids)
}
