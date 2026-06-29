import type { EpicStatus } from '@rpg/contracts/dev-bench'

export const epicQueryKeys = {
  all: ['bench', 'epics'] as const,
  lists: () => [...epicQueryKeys.all, 'list'] as const,
  list: () => [...epicQueryKeys.lists()] as const,
  details: () => [...epicQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...epicQueryKeys.details(), id] as const,
}

export interface EpicListFilters {
  status?: EpicStatus
  area?: string
}
