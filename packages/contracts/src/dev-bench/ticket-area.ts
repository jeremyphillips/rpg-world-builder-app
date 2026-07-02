import { z } from 'zod'

export const ticketAreaSchema = z.string().regex(/^[a-z][a-z0-9_]*$/)

export type TicketArea = z.infer<typeof ticketAreaSchema>

export const TICKET_AREA_SUGGESTIONS = [
  'character_builder',
  'rules',
  'campaigns',
  'contracts',
  'api',
  'ui',
  'combat',
  'content',
  'devops',
  'forms',
  'security',
  'documentation',
  'testing',
  'performance',
  'scalability',
  'security',
  'documentation',
  'testing',
] as const satisfies readonly TicketArea[]
