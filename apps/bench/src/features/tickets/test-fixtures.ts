import type { Ticket } from '@rpg/contracts/dev-bench'

export const sampleTicket: Ticket = {
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

export const blockedSampleTicket: Ticket = {
  ...sampleTicket,
  id: '507f1f77bcf86cd799439012',
  key: 'BENCH-002',
  title: 'Blocked follow-up',
  blockedByTicketIds: [sampleTicket.id],
}
