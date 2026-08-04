import type { QueryClient } from '@tanstack/react-query'
import type { ContentTypeKey, ResolvedContentCampaignAccess } from '@rpg/contracts'

import type { ContentListResult } from '../list/create-content-list'
import { contentOverviewListQueryKey } from './content-overview-query-keys'

type CampaignAccessRow = {
  id: string
  campaignAccess: ResolvedContentCampaignAccess
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
