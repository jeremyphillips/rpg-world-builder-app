import type {
  CreateTicketInput,
  Epic,
  Ticket,
  TicketCreatedBy,
  TicketPriority,
  TicketSize,
  TicketStatus,
  TicketType,
  UpdateTicketInput,
} from '@rpg/contracts/dev-bench'
import { epicSchema, ticketSchema } from '@rpg/contracts/dev-bench'
import { request } from '@rpg/api-client'

import { BENCH_EPICS_PATH, BENCH_TICKETS_PATH, ticketDetailPath } from './bench-api-paths'

/** POST/PATCH/DELETE without CSRF — /api/bench is exempt (plan 02). */
async function benchSendJson<T>(
  method: 'POST' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
  fallbackMessage = 'Request failed.',
): Promise<T> {
  return request<T>(
    path,
    {
      method,
      headers: body !== undefined ? { 'content-type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    },
    fallbackMessage,
  )
}

export interface TicketListQuery {
  status?: TicketStatus
  epicId?: string
  area?: string
  type?: TicketType
  priority?: TicketPriority
  size?: TicketSize
  createdBy?: TicketCreatedBy
}

function buildListQuery(params: TicketListQuery): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      search.set(key, value)
    }
  }
  const query = search.toString()
  return query ? `${BENCH_TICKETS_PATH}?${query}` : BENCH_TICKETS_PATH
}

export async function fetchTickets(params: TicketListQuery = {}): Promise<Ticket[]> {
  const { tickets } = await request<{ tickets: unknown[] }>(
    buildListQuery(params),
    undefined,
    'Could not load tickets.',
  )
  return tickets.map((ticket) => ticketSchema.parse(ticket))
}

export async function fetchTicket(ticketId: string): Promise<Ticket> {
  const { ticket } = await request<{ ticket: unknown }>(
    ticketDetailPath(ticketId),
    undefined,
    'Could not load ticket.',
  )
  return ticketSchema.parse(ticket)
}

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  const { ticket } = await benchSendJson<{ ticket: unknown }>(
    'POST',
    BENCH_TICKETS_PATH,
    input,
    'Could not create ticket.',
  )
  return ticketSchema.parse(ticket)
}

export async function updateTicket(ticketId: string, input: UpdateTicketInput): Promise<Ticket> {
  const { ticket } = await benchSendJson<{ ticket: unknown }>(
    'PATCH',
    ticketDetailPath(ticketId),
    input,
    'Could not update ticket.',
  )
  return ticketSchema.parse(ticket)
}

export async function deleteTicket(ticketId: string): Promise<void> {
  await benchSendJson<void>(
    'DELETE',
    ticketDetailPath(ticketId),
    undefined,
    'Could not delete ticket.',
  )
}

export async function fetchEpics(): Promise<Epic[]> {
  const { epics } = await request<{ epics: unknown[] }>(
    BENCH_EPICS_PATH,
    undefined,
    'Could not load epics.',
  )
  return epics.map((epic) => epicSchema.parse(epic))
}
