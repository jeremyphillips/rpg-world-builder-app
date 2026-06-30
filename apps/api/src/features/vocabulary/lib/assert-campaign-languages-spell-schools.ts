import { LANGUAGE_SET_ID, SPELL_SCHOOL_SET_ID, activeVocabularyOptionIds } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { resolveVocabularySetForCampaign } from '../sets/vocabulary.service'

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
  if (ids.length === 0) return

  const activeIds = await getActiveLanguageIdsForCampaign(campaignId)
  const invalid = ids.filter((id) => !activeIds.has(id))
  if (invalid.length > 0) {
    throw new HttpError(
      400,
      'invalid_vocabulary',
      `Unknown or disabled language: ${invalid.join(', ')}.`,
    )
  }
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
  if (ids.length === 0) return

  const activeIds = await getActiveSpellSchoolIdsForCampaign(campaignId)
  const invalid = ids.filter((id) => !activeIds.has(id))
  if (invalid.length > 0) {
    throw new HttpError(
      400,
      'invalid_vocabulary',
      `Unknown or disabled spell school: ${invalid.join(', ')}.`,
    )
  }
}
