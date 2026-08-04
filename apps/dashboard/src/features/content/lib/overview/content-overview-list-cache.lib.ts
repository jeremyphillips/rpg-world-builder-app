import type { QueryClient } from '@tanstack/react-query'
import type { ContentTypeKey, ResolvedContentCampaignAccess } from '@rpg/contracts'

import type { ContentListResult } from '../list/create-content-list'
import { contentOverviewListQueryKey } from './content-overview-query-keys'

type CampaignAccessRow = {
  id: string
  campaignAccess: ResolvedContentCampaignAccess
}

/** Patch one row's parent location in the shared locations list query cache. */
export function patchContentOverviewListLocationParent<
  T extends { id: string; parentLocationId?: string },
>(
  queryClient: QueryClient,
  campaignId: string,
  entityId: string,
  parentLocationId: string | undefined,
): void {
  queryClient.setQueryData<ContentListResult<T>>(
    contentOverviewListQueryKey(campaignId, 'locations'),
    (current) => {
      if (!current?.items) {
        return current
      }

      return {
        ...current,
        items: current.items.map((row) =>
          row.id === entityId ? { ...row, parentLocationId } : row,
        ),
      }
    },
  )
}

/** Patch one row's campaign access in the shared content list query cache. */
export function patchContentOverviewListCampaignAccess<T extends CampaignAccessRow>(
  queryClient: QueryClient,
  campaignId: string,
  contentTypeKey: ContentTypeKey,
  entityId: string,
  nextAccess: ResolvedContentCampaignAccess,
): void {
  queryClient.setQueryData<ContentListResult<T>>(
    contentOverviewListQueryKey(campaignId, contentTypeKey),
    (current) => {
      if (!current?.items) {
        return current
      }

      return {
        ...current,
        items: current.items.map((row) =>
          row.id === entityId ? { ...row, campaignAccess: nextAccess } : row,
        ),
      }
    },
  )
}
