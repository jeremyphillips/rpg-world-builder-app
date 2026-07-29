import type { PaginatedItems, ReferencingCharacterSummary } from '@rpg/contracts'
import { ORGANIZATION_CHARACTER_REFERENCE } from '@rpg/contracts'

import { resolveCatalogForCampaign } from '../content.service'
import { organizationWriteConfig } from './organizations.config'
import { resolveCharacterReferences } from '../lib/content-character-references/resolve-character-references'

export async function resolveOrganizationConnectedCharacters(input: {
  campaignId: string
  organizationId: string
  page: number
  pageSize: number
}): Promise<PaginatedItems<ReferencingCharacterSummary> | null> {
  const { campaignId, organizationId, page, pageSize } = input

  const catalog = await resolveCatalogForCampaign(organizationWriteConfig.readConfig, campaignId)
  const organization = catalog.find((record) => record.id === organizationId)
  if (!organization) {
    return null
  }

  return resolveCharacterReferences({
    campaignId,
    reference: {
      descriptor: ORGANIZATION_CHARACTER_REFERENCE,
      value: organizationId,
    },
    page,
    pageSize,
  })
}
