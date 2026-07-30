import { describe, expect, it } from 'vitest'

import { assertVocabularyIdAvailable } from './assert-vocabulary-id-available'
import { expectHttpError } from '../../../test/expect-http-error'

describe('assertVocabularyIdAvailable', () => {
  it('passes for a new campaign id', () => {
    expect(() =>
      assertVocabularyIdAvailable({
        id: 'robot',
        reservedIds: new Set(['humanoid']),
      }),
    ).not.toThrow()
  })

  it('rejects ids that shadow system seed entries', () => {
    expectHttpError(
      () =>
        assertVocabularyIdAvailable({
          id: 'humanoid',
          reservedIds: new Set(['humanoid']),
        }),
      409,
    )
  })

  it('rejects duplicate campaign ids in the same set', () => {
    expectHttpError(
      () =>
        assertVocabularyIdAvailable({
          id: 'robot',
          reservedIds: new Set(['humanoid', 'robot']),
        }),
      409,
    )
  })

  it('rejects ids reserved by disabled system entries', () => {
    expectHttpError(
      () =>
        assertVocabularyIdAvailable({
          id: 'fey',
          reservedIds: new Set(['humanoid', 'fey']),
        }),
      409,
    )
  })
})
