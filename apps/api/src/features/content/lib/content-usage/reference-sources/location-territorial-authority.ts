import type { ContentUsageBlocker } from '@rpg/contracts'
import { USAGE_BLOCKER_SOURCE_KEYS } from '@rpg/contracts'

import { toContentUsageBlocker } from '../../../../vocabulary'
import { HomebrewLocationModel } from '../../../locations/homebrew-location.model'
import { extractOrganizationIdsFromTerritorialAuthority } from '../../../locations/location-territorial-authority-reference.lib'
import { indexRecordsByContentId } from './index-by-content-id'
import type { ContentUsageResolverContext } from '../content-usage-context'

type LocationTerritorialAuthorityReferenceRecord = {
  _id: unknown
  name: string
  slug: string
  kind?: string
  territorialAuthority?: Parameters<
    typeof extractOrganizationIdsFromTerritorialAuthority
  >[0]['territorialAuthority']
}

/** Indexes regions by referenced organization ids in territorial authority rows. */
export async function indexLocationTerritorialAuthorityBlockersByContentId(
  ctx: Pick<ContentUsageResolverContext, 'campaignId'>,
): Promise<Map<string, ContentUsageBlocker[]>> {
  const docs = await HomebrewLocationModel.find({
    campaignId: ctx.campaignId,
    kind: 'region',
  })
    .select('_id name slug kind territorialAuthority')
    .lean<LocationTerritorialAuthorityReferenceRecord[]>()

  return indexRecordsByContentId(
    docs,
    (doc) => extractOrganizationIdsFromTerritorialAuthority(doc),
    (doc) =>
      toContentUsageBlocker(
        'locations',
        {
          id: String(doc._id),
          name: doc.name,
          slug: doc.slug,
        },
        USAGE_BLOCKER_SOURCE_KEYS.unknown,
      ),
  )
}
