import { describe, expect, it, vi, beforeEach } from 'vitest'

import { createEpicInputSchema } from '@rpg/contracts/dev-bench'

import { createEpic, fetchEpics } from './epics-client'

const sampleEpic = {
  id: '507f1f77bcf86cd799439011',
  title: 'Character Builder',
  status: 'active',
  createdAt: '2026-06-01T12:00:00.000Z',
  updatedAt: '2026-06-01T12:00:00.000Z',
}

describe('epics-client', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('parses list response with epic schema', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ epics: [sampleEpic] }), { status: 200 }),
    )

    const epics = await fetchEpics()
    expect(epics).toHaveLength(1)
    expect(epics[0]?.title).toBe('Character Builder')
    expect(fetch).toHaveBeenCalledWith('/api/bench/epics', { credentials: 'include' })
  })

  it('creates epics via CSRF-free POST', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ epic: sampleEpic }), { status: 201 }),
    )

    const epic = await createEpic(
      createEpicInputSchema.parse({
        title: 'Character Builder',
        status: 'active',
      }),
    )

    expect(epic.title).toBe('Character Builder')
    expect(fetch).toHaveBeenCalledWith(
      '/api/bench/epics',
      expect.objectContaining({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
      }),
    )
  })
})
