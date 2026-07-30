import type { CampaignAccessSaveResult } from '../../campaign-access/campaign-access-form-context.client'

export type SaveResult =
  | { status: 'saved' }
  | { status: 'blocked' }
  | { status: 'invalid' }
  | { status: 'failed'; error: Error }
  | { status: 'skipped' }

export function mapCampaignAccessSaveResult(result: CampaignAccessSaveResult): SaveResult {
  switch (result.status) {
    case 'skipped':
      return { status: 'skipped' }
    case 'updated':
      return { status: 'saved' }
    case 'blocked':
      return { status: 'blocked' }
    case 'invalid':
      return { status: 'invalid' }
  }
}

export type SaveSurface = {
  dirty: boolean
  save: () => Promise<SaveResult>
}

export type ContentSaveSessionOutcome =
  | { status: 'noop' }
  | { status: 'saved' }
  | { status: 'access_blocked' }
  | { status: 'access_invalid' }
  | { status: 'body_invalid' }
  | { status: 'body_failed'; error: Error }

/** Surfaces that persisted during a coordinated save session. */
export type CoordinatedSaveSavedEvent = {
  accessSaved: boolean
  bodySaved: boolean
  /** Captured before access.save(); present only when accessSaved. */
  accessAvailable?: boolean
}

export type CoordinatedContentSaveInput = {
  accessWasDirty: boolean
  bodyWasDirty: boolean
  readPendingAvailable?: () => boolean | undefined
  access: { save: () => Promise<CampaignAccessSaveResult> }
  body: { save: () => Promise<SaveResult> }
}

export type CoordinatedContentSaveResult =
  | Exclude<ContentSaveSessionOutcome, { status: 'saved' }>
  | { status: 'saved'; saved: CoordinatedSaveSavedEvent }

/** Fixed-order save orchestration: campaign access first, then body. */
export async function runContentSaveSession(
  access: SaveSurface,
  body: SaveSurface,
): Promise<ContentSaveSessionOutcome> {
  if (!access.dirty && !body.dirty) {
    return { status: 'noop' }
  }

  if (access.dirty) {
    const accessResult = await access.save()
    if (accessResult.status === 'blocked') {
      return { status: 'access_blocked' }
    }
    if (accessResult.status === 'invalid' || accessResult.status === 'failed') {
      return { status: 'access_invalid' }
    }
  }

  if (body.dirty) {
    const bodyResult = await body.save()
    if (bodyResult.status === 'blocked') {
      return { status: 'access_blocked' }
    }
    if (bodyResult.status === 'invalid') {
      return { status: 'body_invalid' }
    }
    if (bodyResult.status === 'failed') {
      return { status: 'body_failed', error: bodyResult.error }
    }
  }

  return { status: 'saved' }
}

/**
 * Runs a coordinated save using dirty snapshots taken before persistence.
 * Success feedback should key off `saved` — not post-save dirty flags.
 */
export async function runCoordinatedContentSave(
  input: CoordinatedContentSaveInput,
): Promise<CoordinatedContentSaveResult> {
  const { accessWasDirty, bodyWasDirty, readPendingAvailable } = input
  let accessPersisted = false
  let capturedAvailable: boolean | undefined

  if (accessWasDirty) {
    capturedAvailable = readPendingAvailable?.()
  }

  const outcome = await runContentSaveSession(
    {
      dirty: accessWasDirty,
      save: async () => {
        const result = await input.access.save()
        if (result.status === 'updated') {
          accessPersisted = true
        }
        return mapCampaignAccessSaveResult(result)
      },
    },
    {
      dirty: bodyWasDirty,
      save: input.body.save,
    },
  )

  if (outcome.status !== 'saved') {
    return outcome
  }

  return {
    status: 'saved',
    saved: {
      accessSaved: accessPersisted,
      bodySaved: bodyWasDirty,
      accessAvailable: accessPersisted ? capturedAvailable : undefined,
    },
  }
}
