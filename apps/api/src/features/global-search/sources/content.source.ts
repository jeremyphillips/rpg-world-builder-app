import type { GlobalSearchDocument } from '@rpg/contracts'

import { attachCampaignAccessForTargetType } from '../../content'
import { filterCatalogForMembership } from '../../content'
import { resolveContentForCampaign } from '../../content'
import { buildContentUsageResolverContext } from '../../content'
import { resolveContentUsageLookupKey } from '../../content'
import { resolveViewerCharacterRelationships } from '../../content'
import type { ContentUsageSurfaceKey } from '../../content'
import { projectContentEntity, API_CONTENT_TYPE_KEYS } from '../lib/project-content-document'
import {
  resolveVocabularySetForCampaign,
  vocabularyUsageContextForCampaign,
} from '../../vocabulary'
import { resolveGameTermDisplayImage } from '../lib/resolve-game-term-display-image.lib'
import { requireCampaignRuleset } from '../../vocabulary/lib/patch-document'
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
    const vocabularyContext = vocabularyUsageContextForCampaign(ctx.campaignId)
    const { rulesetId } = await requireCampaignRuleset(ctx.campaignId)
    const spellSchools = await resolveVocabularySetForCampaign(vocabularyContext, 'spell-schools')
    const resolveSpellSchoolDisplay = (schoolId: string) => {
      const option = spellSchools.options.find((entry) => entry.id === schoolId)
      if (!option) return undefined
      return resolveGameTermDisplayImage({
        setId: 'spell-schools',
        optionId: option.id,
        source: option.source,
        media: option.media,
        rulesetId,
      })
    }

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
        const document = projectContentEntity(
          contentType,
          entity as unknown as NamedContentEntity,
          {
            resolveSpellSchoolDisplay,
          },
        )
        documents.push(
          viewerCharacterRelationships ? { ...document, viewerCharacterRelationships } : document,
        )
      }
    }

    return documents
  },
}
