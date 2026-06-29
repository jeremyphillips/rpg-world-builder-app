import type {
  TicketCreatedBy,
  TicketPriority,
  TicketSize,
  TicketType,
} from '@rpg/contracts/dev-bench'

import type { TicketListQuery } from '../api/tickets-client'
import { ticketTitleMatchesSearch } from '../lib/ticket-title-search'

export const EPIC_FILTER_ALL = 'all'
export const EPIC_FILTER_NONE = 'none'

export interface TicketListFilters {
  type?: TicketType
  priority?: TicketPriority
  size?: TicketSize
  epic?: typeof EPIC_FILTER_ALL | typeof EPIC_FILTER_NONE | string
  area?: string
  createdBy?: TicketCreatedBy
  includeWontDo?: boolean
  search?: string
}

export const ticketQueryKeys = {
  all: ['bench', 'tickets'] as const,
  lists: () => [...ticketQueryKeys.all, 'list'] as const,
  list: (filters: TicketListFilters) => [...ticketQueryKeys.lists(), filters] as const,
  bench: () => [...ticketQueryKeys.all, 'bench'] as const,
  linkCatalog: () => [...ticketQueryKeys.all, 'link-catalog'] as const,
  details: () => [...ticketQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...ticketQueryKeys.details(), id] as const,
}

/** Maps UI filters to API query params (client-side epic/status refinements applied after fetch). */
export function toTicketListQuery(filters: TicketListFilters): TicketListQuery {
  const query: TicketListQuery = {}

  if (filters.type) query.type = filters.type
  if (filters.priority) query.priority = filters.priority
  if (filters.size) query.size = filters.size
  if (filters.area) query.area = filters.area
  if (filters.createdBy) query.createdBy = filters.createdBy
  if (filters.epic && filters.epic !== EPIC_FILTER_ALL && filters.epic !== EPIC_FILTER_NONE) {
    query.epicId = filters.epic
  }
  if (!filters.includeWontDo) {
    query.status = 'backlog'
  }

  return query
}

export function applyClientTicketFilters<
  T extends { status: string; epicId?: string | null; title: string },
>(tickets: T[], filters: TicketListFilters): T[] {
  let result = tickets

  if (filters.includeWontDo) {
    result = result.filter((ticket) => ticket.status === 'backlog' || ticket.status === 'wont_do')
  }

  if (filters.epic === EPIC_FILTER_NONE) {
    result = result.filter((ticket) => ticket.epicId == null)
  }

  if (filters.search) {
    result = result.filter((ticket) => ticketTitleMatchesSearch(ticket.title, filters.search))
  }

  return result
}
