import {
  useOverviewSelection,
  type OverviewRowSelectionState,
  type UseOverviewSelectionOptions,
} from '@/lib/data-table/use-overview-selection'

export type ContentOverviewRowSelectionState = OverviewRowSelectionState
export type UseContentOverviewSelectionOptions = UseOverviewSelectionOptions

/** Thin wrapper around the shared overview selection hook for content tables. */
export function useContentOverviewSelection<T extends { id: string }>(
  options: UseOverviewSelectionOptions,
) {
  return useOverviewSelection<T>(options)
}
