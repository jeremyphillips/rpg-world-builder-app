import { describe, expect, it, vi } from 'vitest'

import type { CampaignAccessSaveResult } from '../../campaign-access/campaign-access-form-context.client'
import {
  runCoordinatedContentSave,
  runContentSaveSession,
  type SaveResult,
  type SaveSurface,
} from './content-save-session.lib'

function makeSurface(
  dirty: boolean,
  result: SaveResult,
): SaveSurface & { save: ReturnType<typeof vi.fn> } {
  return {
    dirty,
    save: vi.fn(async () => result),
  }
}

describe('runContentSaveSession', () => {
  it('makes no requests when both surfaces are clean', async () => {
    const access = makeSurface(false, { status: 'saved' })
    const body = makeSurface(false, { status: 'saved' })

    await expect(runContentSaveSession(access, body)).resolves.toEqual({ status: 'noop' })
    expect(access.save).not.toHaveBeenCalled()
    expect(body.save).not.toHaveBeenCalled()
  })

  it('saves access only when body is clean', async () => {
    const access = makeSurface(true, { status: 'saved' })
    const body = makeSurface(false, { status: 'saved' })

    await expect(runContentSaveSession(access, body)).resolves.toEqual({ status: 'saved' })
    expect(access.save).toHaveBeenCalledOnce()
    expect(body.save).not.toHaveBeenCalled()
  })

  it('saves body only when access is clean', async () => {
    const access = makeSurface(false, { status: 'saved' })
    const body = makeSurface(true, { status: 'saved' })

    await expect(runContentSaveSession(access, body)).resolves.toEqual({ status: 'saved' })
    expect(access.save).not.toHaveBeenCalled()
    expect(body.save).toHaveBeenCalledOnce()
  })

  it('saves access before body when both are dirty', async () => {
    const order: string[] = []
    const access = {
      dirty: true,
      save: vi.fn(async () => {
        order.push('access')
        return { status: 'saved' } satisfies SaveResult
      }),
    }
    const body = {
      dirty: true,
      save: vi.fn(async () => {
        order.push('body')
        return { status: 'saved' } satisfies SaveResult
      }),
    }

    await expect(runContentSaveSession(access, body)).resolves.toEqual({ status: 'saved' })
    expect(order).toEqual(['access', 'body'])
  })

  it('does not save body when access is blocked', async () => {
    const access = makeSurface(true, { status: 'blocked' })
    const body = makeSurface(true, { status: 'saved' })

    await expect(runContentSaveSession(access, body)).resolves.toEqual({ status: 'access_blocked' })
    expect(body.save).not.toHaveBeenCalled()
  })

  it('does not save body when access is invalid', async () => {
    const access = makeSurface(true, { status: 'invalid' })
    const body = makeSurface(true, { status: 'saved' })

    await expect(runContentSaveSession(access, body)).resolves.toEqual({ status: 'access_invalid' })
    expect(body.save).not.toHaveBeenCalled()
  })

  it('reports body failure after access saves', async () => {
    const access = makeSurface(true, { status: 'saved' })
    const body = makeSurface(true, {
      status: 'failed',
      error: new Error('Body failed'),
    })

    await expect(runContentSaveSession(access, body)).resolves.toEqual({
      status: 'body_failed',
      error: expect.any(Error),
    })
    expect(access.save).toHaveBeenCalledOnce()
    expect(body.save).toHaveBeenCalledOnce()
  })

  it('does not save body when access save fails', async () => {
    const access = makeSurface(true, { status: 'failed', error: new Error('Access failed') })
    const body = makeSurface(true, { status: 'saved' })

    await expect(runContentSaveSession(access, body)).resolves.toEqual({ status: 'access_invalid' })
    expect(body.save).not.toHaveBeenCalled()
  })

  it('continues when access save is skipped', async () => {
    const access = makeSurface(true, { status: 'skipped' })
    const body = makeSurface(true, { status: 'saved' })

    await expect(runContentSaveSession(access, body)).resolves.toEqual({ status: 'saved' })
    expect(body.save).toHaveBeenCalledOnce()
  })
})

describe('runCoordinatedContentSave', () => {
  const updatedAccess: CampaignAccessSaveResult = {
    status: 'updated',
    campaignAccess: {
      available: true,
      visibilityMode: 'all_players',
      participantIds: [],
      unavailableParticipantIds: [],
      effectiveAudience: 'all_players',
    },
  }

  it('reports access-only success with captured availability', async () => {
    const readPendingAvailable = vi.fn(() => true)

    const result = await runCoordinatedContentSave({
      accessWasDirty: true,
      bodyWasDirty: false,
      readPendingAvailable,
      access: { save: vi.fn(async () => updatedAccess) },
      body: { save: vi.fn(async () => ({ status: 'saved' }) satisfies SaveResult) },
    })

    expect(readPendingAvailable).toHaveBeenCalledOnce()
    expect(result).toEqual({
      status: 'saved',
      saved: { accessSaved: true, bodySaved: false, accessAvailable: true },
    })
  })

  it('reports body-only success without access availability', async () => {
    const result = await runCoordinatedContentSave({
      accessWasDirty: false,
      bodyWasDirty: true,
      access: {
        save: vi.fn(async () => ({ status: 'skipped' }) satisfies CampaignAccessSaveResult),
      },
      body: { save: vi.fn(async () => ({ status: 'saved' }) satisfies SaveResult) },
    })

    expect(result).toEqual({
      status: 'saved',
      saved: { accessSaved: false, bodySaved: true, accessAvailable: undefined },
    })
  })

  it('reports combined save with bodySaved true', async () => {
    const result = await runCoordinatedContentSave({
      accessWasDirty: true,
      bodyWasDirty: true,
      readPendingAvailable: () => false,
      access: { save: vi.fn(async () => updatedAccess) },
      body: { save: vi.fn(async () => ({ status: 'saved' }) satisfies SaveResult) },
    })

    expect(result).toEqual({
      status: 'saved',
      saved: {
        accessSaved: true,
        bodySaved: true,
        accessAvailable: false,
      },
    })
  })
})

describe('runContentSaveSession in-flight guard', () => {
  it('prevents duplicate access requests when wrapped by caller', async () => {
    let inFlight = false
    const access = {
      dirty: true,
      save: vi.fn(async () => {
        if (inFlight) {
          throw new Error('duplicate')
        }
        inFlight = true
        await new Promise((resolve) => setTimeout(resolve, 10))
        inFlight = false
        return { status: 'saved' } satisfies SaveResult
      }),
    }
    const body = makeSurface(false, { status: 'saved' })

    const run = async () => {
      if (inFlight) return { status: 'noop' }
      return runContentSaveSession(access, body)
    }

    const [first, second] = await Promise.all([run(), run()])
    expect(first.status).toBe('saved')
    expect(second.status).toBe('noop')
    expect(access.save).toHaveBeenCalledOnce()
  })
})
