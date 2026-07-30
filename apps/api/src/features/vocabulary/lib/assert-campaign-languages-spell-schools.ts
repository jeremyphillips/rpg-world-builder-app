import { LANGUAGE_SET_ID, SPELL_SCHOOL_SET_ID, activeVocabularyOptionIds } from '@rpg/contracts'

import { resolveVocabularySetForCampaign } from '../sets/vocabulary.service'
import { assertVocabularyIdsActiveInCampaign } from './assert-vocabulary-ids-active-in-campaign'

/** Active language ids for a campaign's resolved vocabulary set. */
export async function getActiveLanguageIdsForCampaign(
  campaignId: string,
): Promise<ReadonlySet<string>> {
  const set = await resolveVocabularySetForCampaign(campaignId, LANGUAGE_SET_ID)
  return activeVocabularyOptionIds(set)
}

/** Rejects ids that are missing or disabled in the campaign vocabulary. */
export async function assertLanguagesActiveInCampaign(
  campaignId: string,
  ids: readonly string[],
): Promise<void> {
  await assertVocabularyIdsActiveInCampaign(campaignId, LANGUAGE_SET_ID, ids)
}

/** Active spell school ids for a campaign's resolved vocabulary set. */
export async function getActiveSpellSchoolIdsForCampaign(
  campaignId: string,
): Promise<ReadonlySet<string>> {
  const set = await resolveVocabularySetForCampaign(campaignId, SPELL_SCHOOL_SET_ID)
  return activeVocabularyOptionIds(set)
}

/** Rejects ids that are missing or disabled in the campaign vocabulary. */
export async function assertSpellSchoolsActiveInCampaign(
  campaignId: string,
  ids: readonly string[],
): Promise<void> {
  await assertVocabularyIdsActiveInCampaign(campaignId, SPELL_SCHOOL_SET_ID, ids)
}
