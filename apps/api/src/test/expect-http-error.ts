import { expect } from 'vitest'

import { HttpError } from '../lib/http-error'

type HttpErrorMatch = {
  status: number
  code?: string
}

/** Asserts a synchronous callback throws `HttpError` with the expected status. */
export function expectHttpError(run: () => void, status: number) {
  try {
    run()
    throw new Error('expected to throw')
  } catch (err) {
    expect(err).toBeInstanceOf(HttpError)
    expect((err as HttpError).status).toBe(status)
  }
}

/** Asserts an async callback rejects with an `HttpError`-shaped object. */
export async function expectHttpErrorAsync(
  run: () => Promise<unknown>,
  match: HttpErrorMatch,
): Promise<void> {
  await expect(run()).rejects.toMatchObject(match)
}
