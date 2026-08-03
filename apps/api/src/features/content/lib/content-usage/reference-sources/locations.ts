import type { ContentUsageBlocker } from '@rpg/contracts'

import { toContentUsageBlocker } from '../../../../vocabulary/lib/reference-sources/content-referrer'
import { HomebrewLocationModel } from '../../../locations/homebrew-location.model'
import { indexRecordsByContentId } from './index-by-content-id'
import type { ContentUsageResolverContext } from '../content-usage-context'

type LocationParentReferenceRecord = {
  _id: unknown
  name: string
  slug: string
  parentLocationId?: string
}

/** Indexes child locations by their parentLocationId for deletion blockers. */
export async function indexLocationParentBlockersByContentId(
  ctx: Pick<ContentUsageResolverContext, 'campaignId'>,
): Promise<Map<string, ContentUsageBlocker[]>> {
  const docs = await HomebrewLocationModel.find({ campaignId: ctx.campaignId })
    .select('_id name slug parentLocationId')
    .lean<LocationParentReferenceRecord[]>()

  return indexRecordsByContentId(
    docs,
    (doc) => (doc.parentLocationId ? [doc.parentLocationId] : []),
    (doc) =>
      toContentUsageBlocker('locations', {
        id: String(doc._id),
        name: doc.name,
        slug: doc.slug,
      }),
  )
}
