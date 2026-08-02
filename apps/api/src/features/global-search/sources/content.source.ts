import type { GlobalSearchDocument } from '@rpg/contracts'

import { attachCampaignAccessForTargetType } from '../../content/lib/content-campaign-access.service'
import { filterCatalogForMembership } from '../../content/lib/filter-catalog-for-viewer'
import { resolveContentForCampaign } from '../../content/content-types'
import { projectContentEntity, API_CONTENT_TYPE_KEYS } from '../lib/project-content-document'
import type { NamedContentEntity } from '../lib/project-content-document'
import type { SearchSource } from '../lib/search-source.types'

export const contentSearchSource: SearchSource = {
  id: 'content',
  async collect(ctx) {
    const membership = {
      campaignRole: ctx.viewerRole,
      pcCharacterIds: [...ctx.viewerControlledCharacterIds],
    }

    const documents: GlobalSearchDocument[] = []

    for (const contentType of API_CONTENT_TYPE_KEYS) {
      const items = await resolveContentForCampaign(contentType, ctx.campaignId)
      const withCampaignAccess = await attachCampaignAccessForTargetType(
        ctx.campaignId,
        contentType,
        items,
      )
      const visible = filterCatalogForMembership(withCampaignAccess, membership)

      for (const entity of visible) {
        documents.push(projectContentEntity(contentType, entity as unknown as NamedContentEntity))
      }
    }

    return documents
  },
}
