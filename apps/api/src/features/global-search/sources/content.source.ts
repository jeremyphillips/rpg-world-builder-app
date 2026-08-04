import type { GlobalSearchDocument } from '@rpg/contracts'

import { attachCampaignAccessForTargetType } from '../../content'
import { filterCatalogForMembership } from '../../content'
import { resolveContentForCampaign } from '../../content'
import { buildContentUsageResolverContext } from '../../content'
import { resolveContentUsageLookupKey } from '../../content'
import { resolveViewerCharacterRelationships } from '../../content'
import type { ContentUsageSurfaceKey } from '../../content'
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

    const controlledCharacterHitCache = new Map()
    const usageCtx = buildContentUsageResolverContext({
      campaignId: ctx.campaignId,
      controlledCharacterHitCache,
      viewer: {
        userId: ctx.viewerUserId,
        role: ctx.viewerRole,
        controlledCharacterIds: ctx.viewerControlledCharacterIds,
      },
    })

    const documents: GlobalSearchDocument[] = []

    for (const contentType of API_CONTENT_TYPE_KEYS) {
      const items = await resolveContentForCampaign(contentType, ctx.campaignId)
      const withCampaignAccess = await attachCampaignAccessForTargetType(
        ctx.campaignId,
        contentType,
        items,
      )
      const visible = filterCatalogForMembership(withCampaignAccess, membership)
      const entities = visible.map((entity) => ({
        id: entity.id,
        slug: entity.slug,
      }))
      const relationshipMap = await resolveViewerCharacterRelationships(
        usageCtx,
        contentType as ContentUsageSurfaceKey,
        entities,
      )

      for (const entity of visible) {
        const lookupKey = resolveContentUsageLookupKey(
          contentType as ContentUsageSurfaceKey,
          entity,
        )
        const viewerCharacterRelationships = relationshipMap.get(lookupKey)
        const document = projectContentEntity(contentType, entity as unknown as NamedContentEntity)
        documents.push(
          viewerCharacterRelationships ? { ...document, viewerCharacterRelationships } : document,
        )
      }
    }

    return documents
  },
}
