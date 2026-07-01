import { expect } from 'vitest'

type ParseResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: { issues: { path?: PropertyKey[]; message?: string }[] } }

export function expectParseSuccess<T>(result: ParseResult<T>): T {
  expect(result.success).toBe(true)
  if (!result.success) {
    throw new Error('Expected parse success')
  }
  return result.data
}

export function expectParseFailure(
  result: ParseResult,
  expected: { path?: PropertyKey[]; message?: string | RegExp },
): void {
  expect(result.success).toBe(false)
  if (result.success) {
    throw new Error('Expected parse failure')
  }

  const issue = result.error.issues[0]
  if (expected.path !== undefined) {
    expect(issue?.path).toEqual(expected.path)
  }
  if (expected.message !== undefined) {
    if (expected.message instanceof RegExp) {
      expect(issue?.message).toMatch(expected.message)
    } else {
      expect(issue?.message).toBe(expected.message)
    }
  }
}
