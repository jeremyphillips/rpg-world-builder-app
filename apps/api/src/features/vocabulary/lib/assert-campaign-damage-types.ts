import { DAMAGE_TYPE_SET_ID, SENSE_SET_ID, activeVocabularyOptionIds } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { resolveVocabularySetForCampaign } from '../sets/vocabulary.service'

/** Active damage type ids for a campaign's resolved vocabulary set. */
export async function getActiveDamageTypeIdsForCampaign(
  campaignId: string,
): Promise<ReadonlySet<string>> {
  const set = await resolveVocabularySetForCampaign(campaignId, DAMAGE_TYPE_SET_ID)
  return activeVocabularyOptionIds(set)
}

/** Rejects ids that are missing or disabled in the campaign vocabulary. */
export async function assertDamageTypesActiveInCampaign(
  campaignId: string,
  ids: readonly string[],
): Promise<void> {
  if (ids.length === 0) return

  const activeIds = await getActiveDamageTypeIdsForCampaign(campaignId)
  const invalid = ids.filter((id) => !activeIds.has(id))
  if (invalid.length > 0) {
    throw new HttpError(
      400,
      'invalid_vocabulary',
      `Unknown or disabled damage type: ${invalid.join(', ')}.`,
    )
  }
}

/** Active sense type ids for a campaign's resolved vocabulary set. */
export async function getActiveSenseIdsForCampaign(
  campaignId: string,
): Promise<ReadonlySet<string>> {
  const set = await resolveVocabularySetForCampaign(campaignId, SENSE_SET_ID)
  return activeVocabularyOptionIds(set)
}

/** Rejects ids that are missing or disabled in the campaign vocabulary. */
export async function assertSensesActiveInCampaign(
  campaignId: string,
  ids: readonly string[],
): Promise<void> {
  if (ids.length === 0) return

  const activeIds = await getActiveSenseIdsForCampaign(campaignId)
  const invalid = ids.filter((id) => !activeIds.has(id))
  if (invalid.length > 0) {
    throw new HttpError(
      400,
      'invalid_vocabulary',
      `Unknown or disabled sense: ${invalid.join(', ')}.`,
    )
  }
}
