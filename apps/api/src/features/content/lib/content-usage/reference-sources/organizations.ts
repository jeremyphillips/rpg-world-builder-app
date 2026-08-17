import type { ContentUsageBlocker } from '@rpg/contracts'
import {
  LOCATION_ORGANIZATION_REFERENCE,
  ORGANIZATION_MEMBER_CLASS_AFFINITY_REFERENCE,
  ORGANIZATION_MEMBER_SPECIES_AFFINITY_REFERENCE,
  USAGE_BLOCKER_SOURCE_KEYS,
} from '@rpg/contracts'

import { toContentUsageBlocker } from '../../../../vocabulary'
import { HomebrewOrganizationModel } from '../../../organizations/homebrew-organization.model'
import { indexRecordsByContentId } from './index-by-content-id'
import type { ContentUsageResolverContext } from '../content-usage-context'
import {
  extractIdsFromOrganizationDescriptor,
  type OrganizationContentUsageHit,
} from './organizations-extract'

/** Organization location connection refs for the locations usage surface. */
export async function indexOrganizationLocationBlockersByContentId(
  ctx: Pick<ContentUsageResolverContext, 'campaignId'>,
): Promise<Map<string, ContentUsageBlocker[]>> {
  const docs = await HomebrewOrganizationModel.find({ campaignId: ctx.campaignId })
    .select('_id name slug connections')
    .lean<OrganizationContentUsageHit[]>()

  return indexRecordsByContentId(
    docs,
    (doc) => extractIdsFromOrganizationDescriptor(doc, LOCATION_ORGANIZATION_REFERENCE.path),
    (doc) =>
      toContentUsageBlocker(
        'organizations',
        {
          id: String(doc._id),
          name: doc.name,
          slug: doc.slug,
        },
        USAGE_BLOCKER_SOURCE_KEYS.unknown,
      ),
  )
}

/** Organization member class affinity refs for the classes usage surface. */
export async function indexOrganizationMemberClassAffinityBlockersByContentId(
  ctx: Pick<ContentUsageResolverContext, 'campaignId'>,
): Promise<Map<string, ContentUsageBlocker[]>> {
  const docs = await HomebrewOrganizationModel.find({ campaignId: ctx.campaignId })
    .select('_id name slug members.classAffinityIds')
    .lean<OrganizationContentUsageHit[]>()

  return indexRecordsByContentId(
    docs,
    (doc) =>
      extractIdsFromOrganizationDescriptor(doc, ORGANIZATION_MEMBER_CLASS_AFFINITY_REFERENCE.path),
    (doc) =>
      toContentUsageBlocker(
        'organizations',
        {
          id: String(doc._id),
          name: doc.name,
          slug: doc.slug,
        },
        USAGE_BLOCKER_SOURCE_KEYS.unknown,
      ),
  )
}

/** Organization member species affinity refs for the species usage surface. */
export async function indexOrganizationMemberSpeciesAffinityBlockersByContentId(
  ctx: Pick<ContentUsageResolverContext, 'campaignId'>,
): Promise<Map<string, ContentUsageBlocker[]>> {
  const docs = await HomebrewOrganizationModel.find({ campaignId: ctx.campaignId })
    .select('_id name slug members.speciesAffinityIds')
    .lean<OrganizationContentUsageHit[]>()

  return indexRecordsByContentId(
    docs,
    (doc) =>
      extractIdsFromOrganizationDescriptor(
        doc,
        ORGANIZATION_MEMBER_SPECIES_AFFINITY_REFERENCE.path,
      ),
    (doc) =>
      toContentUsageBlocker(
        'organizations',
        {
          id: String(doc._id),
          name: doc.name,
          slug: doc.slug,
        },
        USAGE_BLOCKER_SOURCE_KEYS.unknown,
      ),
  )
}
