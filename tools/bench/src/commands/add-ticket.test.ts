import { afterEach, describe, expect, it, vi } from 'vitest'

import { runAddTicket } from './add-ticket'

const sampleTicket = {
  id: '507f1f77bcf86cd799439011',
  key: 'BENCH-010',
  title: 'CLI ticket',
  description: '',
  type: 'feature',
  status: 'up_next',
  priority: 'medium',
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

describe('runAddTicket', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('defaults createdBy to agent and passes status from JSON', async () => {
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      const href = String(url)

      if (href.endsWith('/api/bench/epics')) {
        return Response.json({ epics: [] })
      }

      if (href.endsWith('/api/bench/tickets') && init?.method === 'POST') {
        const body = JSON.parse(String(init.body)) as Record<string, unknown>
        expect(body.createdBy).toBe('agent')
        expect(body.status).toBe('up_next')
        return Response.json({ ticket: sampleTicket }, { status: 201 })
      }

      throw new Error(`Unexpected fetch: ${href}`)
    })

    vi.stubGlobal('fetch', fetchMock)

    const stdout = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)

    await runAddTicket(
      [
        '--json',
        JSON.stringify({
          title: 'CLI ticket',
          type: 'feature',
          priority: 'medium',
          size: 'm',
          status: 'up_next',
        }),
      ],
      { format: 'json', help: false },
    )

    expect(fetchMock).toHaveBeenCalled()
    expect(stdout).toHaveBeenCalledWith(expect.stringContaining('"ok": true'))
  })

  it('adds warning when epicName does not match', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string | URL, init?: RequestInit) => {
        const href = String(url)

        if (href.endsWith('/api/bench/epics')) {
          return Response.json({ epics: [] })
        }

        if (href.endsWith('/api/bench/tickets') && init?.method === 'POST') {
          return Response.json({ ticket: sampleTicket }, { status: 201 })
        }

        throw new Error(`Unexpected fetch: ${href}`)
      }),
    )

    const stdout = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)

    await runAddTicket(
      [
        '--json',
        JSON.stringify({
          title: 'CLI ticket',
          type: 'feature',
          priority: 'medium',
          size: 'm',
          epicName: 'Missing Epic',
        }),
      ],
      { format: 'json', help: false },
    )

    expect(stdout).toHaveBeenCalledWith(expect.stringContaining('warnings'))
  })
})
