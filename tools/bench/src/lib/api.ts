import type {
  CreateEpicInput,
  CreateTicketInput,
  Epic,
  EpicStatus,
  Ticket,
  TicketArea,
  TicketCreatedBy,
  TicketPriority,
  TicketSize,
  TicketStatus,
  TicketType,
  UpdateTicketInput,
} from '@rpg/contracts/dev-bench'
import {
  createEpicInputSchema,
  createTicketInputSchema,
  epicSchema,
  ticketSchema,
  updateTicketInputSchema,
} from '@rpg/contracts/dev-bench'

import { CliError } from './errors'

const BASE_URL = process.env.BENCH_API_URL ?? 'http://localhost:5001'
const API_PREFIX = '/api/bench'

export interface ApiErrorBody {
  error?: {
    code?: string
    message?: string
    details?: unknown
  }
}

export interface ListTicketsQuery {
  status?: TicketStatus
  epicId?: string
  epicName?: string
  bucket?: 'active' | 'done'
  area?: TicketArea
  type?: TicketType
  priority?: TicketPriority
  size?: TicketSize
  createdBy?: TicketCreatedBy
}

export interface ListEpicsQuery {
  status?: EpicStatus
  area?: TicketArea
}

function apiUrl(path: string, query?: Record<string, string | undefined>): string {
  const url = new URL(`${API_PREFIX}${path}`, BASE_URL)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, value)
      }
    }
  }
  return url.toString()
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response

  try {
    response = await fetch(url, init)
  } catch (cause) {
    throw new CliError(
      'NETWORK_ERROR',
      `Could not reach API at ${BASE_URL}. Ensure apps/api is running.`,
      cause instanceof Error ? cause.message : cause,
    )
  }

  const body = (await response.json().catch(() => ({}))) as T & ApiErrorBody

  if (!response.ok) {
    const code = body.error?.code
    const message = body.error?.message ?? `API request failed (${response.status})`

    if (response.status === 404 || code === 'not_found') {
      throw new CliError('NOT_FOUND', message, body.error?.details)
    }

    throw new CliError('API_ERROR', message, body.error?.details)
  }

  return body
}

export async function listTickets(query: ListTicketsQuery = {}): Promise<Ticket[]> {
  const { tickets } = await requestJson<{ tickets: unknown[] }>(
    apiUrl('/tickets', {
      status: query.status,
      epicId: query.epicId,
      epicName: query.epicName,
      bucket: query.bucket,
      area: query.area,
      type: query.type,
      priority: query.priority,
      size: query.size,
      createdBy: query.createdBy,
    }),
  )
  return tickets.map((ticket) => ticketSchema.parse(ticket))
}

export async function getTicketById(ticketId: string): Promise<Ticket> {
  const { ticket } = await requestJson<{ ticket: unknown }>(apiUrl(`/tickets/${ticketId}`))
  return ticketSchema.parse(ticket)
}

export async function getTicketByKey(key: string): Promise<Ticket> {
  const { ticket } = await requestJson<{ ticket: unknown }>(
    apiUrl(`/tickets/by-key/${encodeURIComponent(key)}`),
  )
  return ticketSchema.parse(ticket)
}

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  const payload = createTicketInputSchema.parse(input)
  const { ticket } = await requestJson<{ ticket: unknown }>(apiUrl('/tickets'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return ticketSchema.parse(ticket)
}

export async function updateTicket(ticketId: string, input: UpdateTicketInput): Promise<Ticket> {
  const payload = updateTicketInputSchema.parse(input)
  const { ticket } = await requestJson<{ ticket: unknown }>(apiUrl(`/tickets/${ticketId}`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return ticketSchema.parse(ticket)
}

export async function listEpics(query: ListEpicsQuery = {}): Promise<Epic[]> {
  const { epics } = await requestJson<{ epics: unknown[] }>(
    apiUrl('/epics', {
      status: query.status,
      area: query.area,
    }),
  )
  return epics.map((epic) => epicSchema.parse(epic))
}

export async function createEpic(input: CreateEpicInput): Promise<Epic> {
  const payload = createEpicInputSchema.parse(input)
  const { epic } = await requestJson<{ epic: unknown }>(apiUrl('/epics'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return epicSchema.parse(epic)
}

export function buildListTicketsQuery(values: Record<string, unknown>): ListTicketsQuery {
  const query: ListTicketsQuery = {}

  if (typeof values.status === 'string') query.status = values.status as TicketStatus
  if (typeof values['epic-id'] === 'string') query.epicId = values['epic-id']
  if (typeof values['epic-name'] === 'string') query.epicName = values['epic-name']
  if (values.bucket === 'active' || values.bucket === 'done') query.bucket = values.bucket
  if (typeof values.area === 'string') query.area = values.area as TicketArea
  if (typeof values.type === 'string') query.type = values.type as TicketType
  if (typeof values.priority === 'string') query.priority = values.priority as TicketPriority
  if (typeof values.size === 'string') query.size = values.size as TicketSize
  if (typeof values['created-by'] === 'string') {
    query.createdBy = values['created-by'] as TicketCreatedBy
  }

  return query
}

export function buildListEpicsQuery(values: Record<string, unknown>): ListEpicsQuery {
  const query: ListEpicsQuery = {}

  if (typeof values.status === 'string') query.status = values.status as EpicStatus
  if (typeof values.area === 'string') query.area = values.area as TicketArea

  return query
}
