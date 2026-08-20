import type { QueryClient } from '@tanstack/react-query'

import { invalidateContentWriteQueries } from '../../../lib/list/use-content-mutations'
import { locationsQueryKey } from '../../hooks/use-locations'

/** Shared invalidation contract for all successful location hierarchy mutations. */
export function invalidateLocationHierarchyQueries(
  queryClient: QueryClient,
  campaignId: string,
): void {
  invalidateContentWriteQueries(queryClient, campaignId, locationsQueryKey)
}
