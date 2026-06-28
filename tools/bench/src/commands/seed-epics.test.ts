import { afterEach, describe, expect, it, vi } from 'vitest'

import { SEED_EPICS } from '@rpg/dev-bench-core'

import { runSeedEpics } from './seed-epics'

describe('runSeedEpics', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('creates missing epics and skips existing matches', async () => {
    const existingTitle = SEED_EPICS[0]!.title
    const createdTitles: string[] = []

    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string | URL, init?: RequestInit) => {
        const href = String(url)

        if (href.endsWith('/api/bench/epics') && init?.method !== 'POST') {
          return Response.json({
            epics: [
              {
                id: 'existing-epic',
                title: existingTitle,
                description: '',
                goal: 'Existing',
                status: 'active',
                priority: 'high',
                area: 'rules',
                createdAt: '2026-06-01T00:00:00.000Z',
                updatedAt: '2026-06-01T00:00:00.000Z',
              },
            ],
          })
        }

        if (href.endsWith('/api/bench/epics') && init?.method === 'POST') {
          const body = JSON.parse(String(init.body)) as Record<string, unknown>
          expect(body).not.toHaveProperty('normalizedTitle')
          createdTitles.push(String(body.title))
          return Response.json(
            {
              epic: {
                id: 'new-epic',
                title: body.title,
                description: body.description ?? '',
                goal: body.goal ?? '',
                status: 'active',
                priority: body.priority,
                area: body.area,
                createdAt: '2026-06-01T00:00:00.000Z',
                updatedAt: '2026-06-01T00:00:00.000Z',
              },
            },
            { status: 201 },
          )
        }

        throw new Error(`Unexpected fetch: ${href}`)
      }),
    )

    const stdout = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)

    await runSeedEpics([], { format: 'json', help: false })

    expect(createdTitles.length).toBe(SEED_EPICS.length - 1)
    expect(stdout).toHaveBeenCalledWith(expect.stringContaining(`"${existingTitle}"`))
  })
})
