import { getLocationKindLabel, type LocationKind } from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import { HomebrewLocationModel } from '../content'

/** Validates that a campaign primary world reference exists, is in-campaign, and is a world. */
export async function validateCampaignPrimaryWorldId(
  campaignId: string,
  primaryWorldId: string,
): Promise<void> {
  const location = await HomebrewLocationModel.findOne({ _id: primaryWorldId, campaignId })
    .select('kind')
    .lean<{ kind: string }>()

  if (!location) {
    throw HttpError.badRequest('Primary world location was not found in this campaign.')
  }

  if (location.kind !== 'world') {
    throw HttpError.badRequest(
      `Primary world must be a ${getLocationKindLabel('world')}, not a ${getLocationKindLabel(location.kind as LocationKind)}.`,
    )
  }
}
