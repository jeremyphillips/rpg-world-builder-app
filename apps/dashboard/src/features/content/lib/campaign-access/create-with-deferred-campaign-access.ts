import type { ContentCampaignAccessPatch } from '@rpg/contracts'

import { updateRouteContentCampaignAccess } from './campaign-access-api'
import { isDefaultCampaignAccessPatch } from './campaign-access-state'

export type CreateWithDeferredCampaignAccessParams<TInput, TEntity extends { id: string }> = {
  campaignId: string
  routeKey: string
  createInput: TInput
  mutateAsync: (input: TInput) => Promise<TEntity>
  pendingAccess: ContentCampaignAccessPatch | null
}

export type CreateWithDeferredCampaignAccessResult<TEntity extends { id: string }> = {
  entity: TEntity
  deferredAccessFailed: boolean
}

/** Creates content, then PATCHes campaign access when the draft is non-default. */
export async function createWithDeferredCampaignAccess<TInput, TEntity extends { id: string }>({
  campaignId,
  routeKey,
  createInput,
  mutateAsync,
  pendingAccess,
}: CreateWithDeferredCampaignAccessParams<TInput, TEntity>): Promise<
  CreateWithDeferredCampaignAccessResult<TEntity>
> {
  const entity = await mutateAsync(createInput)
  let deferredAccessFailed = false

  if (pendingAccess && !isDefaultCampaignAccessPatch(pendingAccess)) {
    try {
      await updateRouteContentCampaignAccess(campaignId, routeKey, entity.id, pendingAccess)
    } catch {
      deferredAccessFailed = true
    }
  }

  return { entity, deferredAccessFailed }
}
