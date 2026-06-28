import { describe, expect, it, vi } from 'vitest'

import type { Ticket } from '@rpg/contracts/dev-bench'

import { writeSuccess } from './output'

const sampleTicket: Ticket = {
  id: '507f1f77bcf86cd799439011',
  key: 'BENCH-001',
  title: 'Sample ticket',
  description: '',
  type: 'feature',
  status: 'backlog',
  priority: 'high',
  size: 'm',
  epicId: null,
  blockedByTicketIds: [],
  relatedTicketIds: [],
  acceptanceCriteria: [],
  codeRefs: [],
  createdBy: 'agent',
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
}

describe('writeSuccess', () => {
  it('writes JSON envelope to stdout', () => {
    const write = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)

    writeSuccess('json', { ticket: sampleTicket })

    expect(write).toHaveBeenCalledWith(expect.stringContaining('"ok": true'))
    expect(write).toHaveBeenCalledWith(expect.stringContaining('"key": "BENCH-001"'))

    write.mockRestore()
  })

  it('writes text ticket snapshot to stdout', () => {
    const write = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)

    writeSuccess('text', { ticket: sampleTicket })

    expect(write).toHaveBeenCalledWith(expect.stringContaining('# BENCH-001'))

    write.mockRestore()
  })
})
