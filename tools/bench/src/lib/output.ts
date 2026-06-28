import type { Epic, Ticket } from '@rpg/contracts/dev-bench'
import { getTicketPriorityLabel, getTicketStatusLabel } from '@rpg/contracts/dev-bench'
import { formatTicketForAgent } from '@rpg/dev-bench-core'

import type { OutputFormat } from './args'
import { CliError, isCliError } from './errors'

export interface SuccessEnvelope<T> {
  ok: true
  data: T
}

export interface ErrorEnvelope {
  ok: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export function writeSuccess<T>(format: OutputFormat, data: T): void {
  if (format === 'text') {
    process.stdout.write(formatSuccessText(data))
    return
  }

  const envelope: SuccessEnvelope<T> = { ok: true, data }
  process.stdout.write(`${JSON.stringify(envelope, null, 2)}\n`)
}

export function writeFailure(format: OutputFormat, error: unknown): never {
  const cliError = normalizeError(error)

  if (format === 'text') {
    process.stderr.write(`${cliError.message}\n`)
  } else {
    const envelope: ErrorEnvelope = {
      ok: false,
      error: {
        code: cliError.code,
        message: cliError.message,
        ...(cliError.details !== undefined ? { details: cliError.details } : {}),
      },
    }
    process.stderr.write(`${JSON.stringify(envelope, null, 2)}\n`)
  }

  process.exit(1)
  throw new Error('unreachable')
}

function normalizeError(error: unknown): CliError {
  if (isCliError(error)) {
    return error
  }

  if (error instanceof Error) {
    return new CliError('VALIDATION_ERROR', error.message)
  }

  return new CliError('VALIDATION_ERROR', 'Unknown error')
}

function formatSuccessText(data: unknown): string {
  if (!data || typeof data !== 'object') {
    return `${String(data)}\n`
  }

  const record = data as Record<string, unknown>
  const formatters: Array<(value: Record<string, unknown>) => string | null> = [
    formatSuggestNextSuccessText,
    formatTicketSuccessText,
    formatTicketsSuccessText,
    formatEpicSuccessText,
    formatEpicsSuccessText,
    formatSeedSummaryText,
  ]

  for (const formatter of formatters) {
    const text = formatter(record)
    if (text) return text
  }

  return `${JSON.stringify(data, null, 2)}\n`
}

function formatSuggestNextSuccessText(data: Record<string, unknown>): string | null {
  if (!('ticket' in data) || !('context' in data)) return null

  if (data.ticket === null) {
    return 'No eligible ticket.\n'
  }

  if (typeof data.ticket !== 'object') return null
  return `${formatTicketForAgent(data.ticket as Ticket)}\n`
}

function formatTicketSuccessText(data: Record<string, unknown>): string | null {
  if (!data.ticket || typeof data.ticket !== 'object') return null
  return `${formatTicketForAgent(data.ticket as Ticket)}\n`
}

function formatTicketsSuccessText(data: Record<string, unknown>): string | null {
  if (!Array.isArray(data.tickets)) return null
  return `${formatTicketsText(data.tickets as Ticket[])}\n`
}

function formatEpicSuccessText(data: Record<string, unknown>): string | null {
  if (!data.epic || typeof data.epic !== 'object') return null
  const epic = data.epic as Epic
  return `${epic.title} (${epic.status})\n`
}

function formatEpicsSuccessText(data: Record<string, unknown>): string | null {
  if (!Array.isArray(data.epics)) return null
  return `${formatEpicsText(data.epics as Epic[])}\n`
}

function formatSeedSummaryText(data: Record<string, unknown>): string | null {
  if (!('created' in data) && !('skipped' in data)) return null

  const created = Array.isArray(data.created) ? data.created : []
  const skipped = Array.isArray(data.skipped) ? data.skipped : []
  const lines = [
    `Created: ${created.length === 0 ? 'none' : created.join(', ')}`,
    `Skipped: ${skipped.length === 0 ? 'none' : skipped.join(', ')}`,
  ]
  return `${lines.join('\n')}\n`
}

export function formatTicketsText(tickets: Ticket[]): string {
  if (tickets.length === 0) {
    return 'No tickets.'
  }

  return tickets
    .map(
      (ticket) =>
        `- **${ticket.key}** ${ticket.title} — ${getTicketStatusLabel(ticket.status)}, ${getTicketPriorityLabel(ticket.priority)}`,
    )
    .join('\n')
}

export function formatEpicsText(epics: Epic[]): string {
  if (epics.length === 0) {
    return 'No epics.'
  }

  return epics.map((epic) => `- ${epic.title} (${epic.status})`).join('\n')
}
