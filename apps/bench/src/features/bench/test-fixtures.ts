import type { Ticket } from '@rpg/contracts/dev-bench'
import type { BenchColumn } from '@rpg/dev-bench-core'

const baseTicket: Ticket = {
  id: '507f1f77bcf86cd799439011',
  key: 'BENCH-001',
  title: 'Add ticket CRUD UI',
  description: 'Backlog filters and detail form',
  type: 'feature',
  status: 'backlog',
  priority: 'high',
  size: 'm',
  area: 'ui',
  epicId: null,
  blockedByTicketIds: [],
  relatedTicketIds: [],
  acceptanceCriteria: ['Backlog lists tickets'],
  codeRefs: [{ path: 'apps/bench/src/features/tickets/routes/backlog-page.tsx' }],
  createdBy: 'user',
  createdAt: '2026-06-01T12:00:00.000Z',
  updatedAt: '2026-06-01T12:00:00.000Z',
}

export const upNextTicket: Ticket = {
  ...baseTicket,
  id: '507f1f77bcf86cd799439021',
  key: 'BENCH-101',
  title: 'Bench workflow columns',
  status: 'up_next',
}

export const inProgressTicket: Ticket = {
  ...baseTicket,
  id: '507f1f77bcf86cd799439022',
  key: 'BENCH-102',
  title: 'Status move menu',
  status: 'in_progress',
  priority: 'critical',
}

export const blockedBenchTicket: Ticket = {
  ...baseTicket,
  id: '507f1f77bcf86cd799439023',
  key: 'BENCH-103',
  title: 'Blocked on dependency',
  status: 'blocked',
  blockedByTicketIds: [baseTicket.id],
}

export const doneTicket: Ticket = {
  ...baseTicket,
  id: '507f1f77bcf86cd799439024',
  key: 'BENCH-104',
  title: 'Shipped feature',
  status: 'done',
}

export const emptyBenchColumns = (): Record<BenchColumn, Ticket[]> => ({
  up_next: [],
  in_progress: [],
  blocked: [],
  done: [],
})

export const populatedBenchColumns = (): Record<BenchColumn, Ticket[]> => ({
  up_next: [upNextTicket],
  in_progress: [inProgressTicket],
  blocked: [blockedBenchTicket],
  done: [doneTicket],
})
