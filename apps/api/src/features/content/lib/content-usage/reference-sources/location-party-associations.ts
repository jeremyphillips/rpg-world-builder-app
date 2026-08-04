import type { ContentUsageBlocker } from '@rpg/contracts'

import { toContentUsageBlocker } from '../../../../vocabulary/lib/reference-sources/content-referrer'
import { HomebrewLocationModel } from '../../../locations/homebrew-location.model'
import { extractAllPartyIdsFromLocation } from '../../../locations/location-party-reference.lib'
import { indexRecordsByContentId } from './index-by-content-id'
import type { ContentUsageResolverContext } from '../content-usage-context'

type LocationPartyReferenceRecord = {
  _id: unknown
  name: string
  slug: string
  partyAssociations?: Parameters<typeof extractAllPartyIdsFromLocation>[0]['partyAssociations']
}

/** Indexes locations by referenced character or organization party ids. */
export async function indexLocationPartyBlockersByContentId(
  ctx: Pick<ContentUsageResolverContext, 'campaignId'>,
): Promise<Map<string, ContentUsageBlocker[]>> {
  const docs = await HomebrewLocationModel.find({ campaignId: ctx.campaignId })
    .select('_id name slug partyAssociations')
    .lean<LocationPartyReferenceRecord[]>()

  return indexRecordsByContentId(
    docs,
    (doc) => extractAllPartyIdsFromLocation(doc),
    (doc) =>
      toContentUsageBlocker('locations', {
        id: String(doc._id),
        name: doc.name,
        slug: doc.slug,
      }),
  )
}

/** Location blockers anywhere in the database for a single character id. */
export async function findLocationPartyBlockersForCharacter(
  characterId: string,
): Promise<ContentUsageBlocker[]> {
  const docs = await HomebrewLocationModel.find({
    partyAssociations: {
      $elemMatch: {
        'party.kind': 'character',
        'party.characterId': characterId,
      },
    },
  })
    .select('_id name slug')
    .lean<LocationPartyReferenceRecord[]>()

  return docs.map((doc) =>
    toContentUsageBlocker('locations', {
      id: String(doc._id),
      name: doc.name,
      slug: doc.slug,
    }),
  )
}

/** Location blockers in one campaign for a single character id. */
export async function findLocationPartyBlockersForCharacterInCampaign(
  campaignId: string,
  characterId: string,
): Promise<ContentUsageBlocker[]> {
  const docs = await HomebrewLocationModel.find({
    campaignId,
    partyAssociations: {
      $elemMatch: {
        'party.kind': 'character',
        'party.characterId': characterId,
      },
    },
  })
    .select('_id name slug')
    .lean<LocationPartyReferenceRecord[]>()

  return docs.map((doc) =>
    toContentUsageBlocker('locations', {
      id: String(doc._id),
      name: doc.name,
      slug: doc.slug,
    }),
  )
}
