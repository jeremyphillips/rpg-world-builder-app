import type { Ticket } from '@rpg/contracts/dev-bench'
import { describe, expect, it } from 'vitest'

import { formatTicketForAgent } from './ticket-for-agent'

const sampleTicket: Ticket = {
  id: 'ticket_1',
  key: 'BENCH-001',
  title: 'Add patch write support',
  description: 'Cursor identified that this path is skipped.',
  type: 'feature',
  status: 'backlog',
  priority: 'high',
  size: 'm',
  area: 'rules',
  epicId: 'epic_1',
  blockedByTicketIds: ['ticket_blocker'],
  relatedTicketIds: ['ticket_related'],
  acceptanceCriteria: ['Patch write path exists', 'Schema validation is applied'],
  codeRefs: [
    {
      path: 'packages/contracts/src/rpg/campaign',
      symbol: 'campaignRulesSchema',
      lineStart: 10,
      lineEnd: 20,
      note: 'Rules patch entry point',
    },
  ],
  createdBy: 'user',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
}

describe('formatTicketForAgent', () => {
  it('includes key, title, and acceptance criteria', () => {
    const output = formatTicketForAgent(sampleTicket)

    expect(output).toContain('# BENCH-001 — Add patch write support')
    expect(output).toContain('Patch write path exists')
    expect(output).toContain('Schema validation is applied')
  })

  it('includes metadata, links, and code refs', () => {
    const output = formatTicketForAgent(sampleTicket)

    expect(output).toContain('**Type:** Feat')
    expect(output).toContain('**Priority:** High')
    expect(output).toContain('**Area:** rules')
    expect(output).toContain('**Epic ID:** epic_1')
    expect(output).toContain('ticket_blocker')
    expect(output).toContain('ticket_related')
    expect(output).toContain('packages/contracts/src/rpg/campaign')
    expect(output).toContain('symbol: campaignRulesSchema')
  })

  it('is a pure formatter with stable output for the same ticket', () => {
    expect(formatTicketForAgent(sampleTicket)).toBe(formatTicketForAgent(sampleTicket))
  })

  it('renders empty optional sections as none', () => {
    const output = formatTicketForAgent({
      ...sampleTicket,
      description: undefined,
      area: undefined,
      epicId: undefined,
      blockedByTicketIds: [],
      relatedTicketIds: [],
      acceptanceCriteria: [],
      codeRefs: [],
    })

    expect(output).toContain('## Description')
    expect(output).toContain('_None_')
  })

  it('renders stored HTML description as plain text', () => {
    const output = formatTicketForAgent({
      ...sampleTicket,
      description: '<p>Cursor identified that this path is <strong>skipped</strong>.</p>',
    })

    expect(output).toContain('Cursor identified that this path is skipped.')
    expect(output).not.toContain('<strong>')
  })

  it('emits stored markdown description unchanged', () => {
    const markdown = '## Context\n\nUse `pnpm bench add-ticket`.'
    const output = formatTicketForAgent({
      ...sampleTicket,
      description: markdown,
    })

    expect(output).toContain(markdown)
  })
})
