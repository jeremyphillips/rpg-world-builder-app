import { describe, expect, it } from 'vitest'

import { combineQueryError, resolveQueryErrorLabel } from './resolve-query-error-label.lib'

describe('resolveQueryErrorLabel', () => {
  it('returns the first query error message', () => {
    expect(
      resolveQueryErrorLabel([
        { isPending: false, isError: false, error: null },
        { isPending: false, isError: true, error: new Error('NPC not found') },
        { isPending: false, isError: true, error: new Error('Context failed') },
      ]),
    ).toBe('NPC not found')
  })

  it('returns fallback when no query errors carry a message', () => {
    expect(
      resolveQueryErrorLabel(
        [{ isPending: false, isError: false, error: null }],
        'Could not load NPC.',
      ),
    ).toBe('Could not load NPC.')
  })
})

describe('combineQueryError', () => {
  it('is true when any query is in error', () => {
    expect(
      combineQueryError([
        { isPending: false, isError: false, error: null },
        { isPending: false, isError: true, error: new Error('fail') },
      ]),
    ).toBe(true)
    expect(combineQueryError([{ isPending: false, isError: false, error: null }])).toBe(false)
  })
})
