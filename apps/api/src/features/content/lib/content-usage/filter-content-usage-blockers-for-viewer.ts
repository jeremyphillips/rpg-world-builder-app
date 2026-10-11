import type { ContentAccessTargetType, ContentUsageBlocker } from '@rpg/contracts'
import {
  buildContentViewerFromCampaignContext,
  isContentVisibleToViewer,
  resolveContentCampaignAccess,
  resolveDefaultContentCampaignAccess,
} from '@rpg/contracts'

import { loadValidCampaignParticipantIds } from '../campaign-access-participants.service'
import {
  resolveContentUsagePurpose,
  type ContentUsageResolverContext,
} from './content-usage-context'

function viewerFromContext(ctx: ContentUsageResolverContext) {
  if (!ctx.viewer) {
    return buildContentViewerFromCampaignContext(undefined)
  }
  return buildContentViewerFromCampaignContext({
    campaignRole: ctx.viewer.role,
    pcCharacterIds: [...ctx.viewer.controlledCharacterIds],
  })
}

/** Hides catalog referrers the viewer cannot see (e.g. DM-only monsters) from usage reads. */
export async function filterContentUsageBlockersForViewer(
  ctx: ContentUsageResolverContext,
  blockers: readonly ContentUsageBlocker[],
): Promise<ContentUsageBlocker[]> {
  if (resolveContentUsagePurpose(ctx) === 'authoritative_guard') {
    return [...blockers]
  }

  const contentBlockers = blockers.filter(
    (blocker): blocker is Extract<ContentUsageBlocker, { kind: 'content' }> =>
      blocker.kind === 'content',
  )

  if (contentBlockers.length === 0) {
    return [...blockers]
  }

  const { loadCampaignAccessByTargetIds } = await import('../content-campaign-access.service')
  const validParticipantIds = await loadValidCampaignParticipantIds(ctx.campaignId)

  const byType = new Map<string, string[]>()
  for (const blocker of contentBlockers) {
    const ids = byType.get(blocker.contentTypeKey) ?? []
    ids.push(blocker.id)
    byType.set(blocker.contentTypeKey, ids)
  }

  const accessByContentId = new Map<string, ReturnType<typeof resolveContentCampaignAccess>>()
  for (const [contentTypeKey, ids] of byType) {
    const targetType = contentTypeKey as ContentAccessTargetType
    const accessById = await loadCampaignAccessByTargetIds(ctx.campaignId, targetType, ids)
    for (const id of ids) {
      accessByContentId.set(
        `${contentTypeKey}:${id}`,
        accessById.get(id) ??
          resolveContentCampaignAccess(null, {
            validParticipantIds,
            defaultAccess: resolveDefaultContentCampaignAccess(targetType),
          }),
      )
    }
  }

  const viewer = viewerFromContext(ctx)

  return blockers.filter((blocker) => {
    if (blocker.kind !== 'content') {
      return true
    }
    const access =
      accessByContentId.get(`${blocker.contentTypeKey}:${blocker.id}`) ??
      resolveContentCampaignAccess(null, {
        validParticipantIds,
        defaultAccess: resolveDefaultContentCampaignAccess(
          blocker.contentTypeKey as ContentAccessTargetType,
        ),
      })
    return isContentVisibleToViewer({ campaignAccess: access }, viewer)
  })
}
