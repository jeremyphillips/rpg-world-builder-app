export type SaveResult =
  | { status: 'saved' }
  | { status: 'blocked' }
  | { status: 'invalid' }
  | { status: 'failed'; error: Error }
  | { status: 'skipped' }

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
