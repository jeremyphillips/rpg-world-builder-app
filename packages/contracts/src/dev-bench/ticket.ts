import { z } from 'zod'

import { codeRefSchema } from './code-ref'
import { ticketAreaSchema } from './ticket-area'
import { ticketKeySchema } from './ticket-key'

// ---------------------------------------------------------------------------
// Ticket enums
// ---------------------------------------------------------------------------

export const TICKET_TYPES = [
  'bug',
  'feature',
  'test',
  'refactor',
  'docs',
  'chore',
  'research',
  'design',
] as const

export const ticketTypeSchema = z.enum(TICKET_TYPES)
export type TicketType = z.infer<typeof ticketTypeSchema>

export const TICKET_TYPE_LABELS: Record<TicketType, string> = {
  bug: 'Bug',
  feature: 'Feat',
  test: 'Test',
  refactor: 'Refactor',
  docs: 'Docs',
  chore: 'Chore',
  research: 'Research',
  design: 'Design',
}

export function getTicketTypeLabel(type: string): string {
  return TICKET_TYPE_LABELS[type as TicketType] ?? type
}

export const TICKET_STATUSES = [
  'backlog',
  'up_next',
  'in_progress',
  'blocked',
  'done',
  'wont_do',
] as const

export const ticketStatusSchema = z.enum(TICKET_STATUSES)
export type TicketStatus = z.infer<typeof ticketStatusSchema>

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  backlog: 'Backlog',
  up_next: 'Up Next',
  in_progress: 'In Progress',
  blocked: 'Blocked',
  done: 'Done',
  wont_do: "Won't Do",
}

export function getTicketStatusLabel(status: string): string {
  return TICKET_STATUS_LABELS[status as TicketStatus] ?? status
}

export const TICKET_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const

export const ticketPrioritySchema = z.enum(TICKET_PRIORITIES)
export type TicketPriority = z.infer<typeof ticketPrioritySchema>

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

export function getTicketPriorityLabel(priority: string): string {
  return TICKET_PRIORITY_LABELS[priority as TicketPriority] ?? priority
}

export const TICKET_SIZES = ['xs', 's', 'm', 'l', 'xl'] as const

export const ticketSizeSchema = z.enum(TICKET_SIZES)
export type TicketSize = z.infer<typeof ticketSizeSchema>

export const TICKET_SIZE_LABELS: Record<TicketSize, string> = {
  xs: 'XS',
  s: 'S',
  m: 'M',
  l: 'L',
  xl: 'XL',
}

export function getTicketSizeLabel(size: string): string {
  return TICKET_SIZE_LABELS[size as TicketSize] ?? size
}

export const TICKET_CREATED_BY = ['user', 'agent'] as const

export const ticketCreatedBySchema = z.enum(TICKET_CREATED_BY)
export type TicketCreatedBy = z.infer<typeof ticketCreatedBySchema>

export const TICKET_CREATED_BY_LABELS: Record<TicketCreatedBy, string> = {
  user: 'User',
  agent: 'Agent',
}

export function getTicketCreatedByLabel(createdBy: string): string {
  return TICKET_CREATED_BY_LABELS[createdBy as TicketCreatedBy] ?? createdBy
}

// ---------------------------------------------------------------------------
// Ticket entity
// ---------------------------------------------------------------------------

export const ticketSchema = z.object({
  id: z.string().min(1),
  key: ticketKeySchema,
  title: z.string().min(1),
  description: z.string().optional(),
  type: ticketTypeSchema,
  status: ticketStatusSchema,
  priority: ticketPrioritySchema,
  size: ticketSizeSchema,
  area: ticketAreaSchema.optional(),
  epicId: z.string().nullable().optional(),
  blockedByTicketIds: z.array(z.string()),
  relatedTicketIds: z.array(z.string()),
  acceptanceCriteria: z.array(z.string()),
  codeRefs: z.array(codeRefSchema),
  createdBy: ticketCreatedBySchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Ticket = z.infer<typeof ticketSchema>
