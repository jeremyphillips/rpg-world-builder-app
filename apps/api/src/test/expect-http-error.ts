import { expect } from 'vitest'

import { HttpError } from '../lib/http-error'

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
