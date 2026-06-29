import { afterEach, describe, expect, it, vi } from 'vitest'

import { buildRecommendContext, runSuggestNext } from './suggest-next'

const sampleEpic = {
  id: 'epic-1',
  title: 'Rules Configuration',
  status: 'active',
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
}

const eligibleTicket = {
  id: '507f1f77bcf86cd799439011',
  key: 'BENCH-010',
  title: 'Patch write support',
  type: 'feature',
  status: 'up_next',
  priority: 'high',
  size: 'm',
  epicId: 'epic-1',
  area: 'rules',
  blockedByTicketIds: [],
  relatedTicketIds: [],
  acceptanceCriteria: [],
  codeRefs: [],
  createdBy: 'agent',
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-02T00:00:00.000Z',
}

describe('buildRecommendContext', () => {
  it('maps epic id and area flags', () => {
    expect(
      buildRecommendContext({
        'epic-id': 'epic-1',
        area: 'rules',
      }),
    ).toEqual({ epicId: 'epic-1', area: 'rules' })
  })
})

describe('runSuggestNext', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('returns the best eligible ticket as JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string | URL) => {
        const href = String(url)

        if (href.endsWith('/api/bench/epics')) {
          return Response.json({ epics: [sampleEpic] })
        }

        if (href.endsWith('/api/bench/tickets')) {
          return Response.json({
            tickets: [
              eligibleTicket,
              {
                ...eligibleTicket,
                id: '507f1f77bcf86cd799439012',
                key: 'BENCH-011',
                status: 'in_progress',
              },
            ],
          })
        }

        throw new Error(`Unexpected fetch: ${href}`)
      }),
    )

    const stdout = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)

    await runSuggestNext(['--epic-id', 'epic-1'], { format: 'json', help: false })

    const output = String(stdout.mock.calls[0]?.[0])
    expect(output).toContain('"ok": true')
    expect(output).toContain('"key": "BENCH-010"')
    expect(output).toContain('"epicId": "epic-1"')
  })

  it('returns null ticket when nothing is eligible', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string | URL) => {
        const href = String(url)

        if (href.endsWith('/api/bench/epics')) {
          return Response.json({ epics: [sampleEpic] })
        }

        if (href.endsWith('/api/bench/tickets')) {
          return Response.json({
            tickets: [{ ...eligibleTicket, status: 'done' }],
          })
        }

        throw new Error(`Unexpected fetch: ${href}`)
      }),
    )

    const stdout = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)

    await runSuggestNext([], { format: 'json', help: false })

    const output = String(stdout.mock.calls[0]?.[0])
    expect(output).toContain('"ticket": null')
  })

  it('resolves epic name and fails when unmatched', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string | URL) => {
        const href = String(url)

        if (href.endsWith('/api/bench/epics')) {
          return Response.json({ epics: [sampleEpic] })
        }

        if (href.endsWith('/api/bench/tickets')) {
          return Response.json({ tickets: [] })
        }

        throw new Error(`Unexpected fetch: ${href}`)
      }),
    )

    await expect(
      runSuggestNext(['--epic-name', 'Missing Epic'], { format: 'json', help: false }),
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
      message: 'No epic matched epicName "Missing Epic".',
    })
  })

  it('formats text output for no match', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string | URL) => {
        const href = String(url)

        if (href.endsWith('/api/bench/epics')) {
          return Response.json({ epics: [] })
        }

        if (href.endsWith('/api/bench/tickets')) {
          return Response.json({ tickets: [] })
        }

        throw new Error(`Unexpected fetch: ${href}`)
      }),
    )

    const stdout = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)

    await runSuggestNext([], { format: 'text', help: false })

    expect(String(stdout.mock.calls[0]?.[0])).toContain('No eligible ticket.')
  })
})
