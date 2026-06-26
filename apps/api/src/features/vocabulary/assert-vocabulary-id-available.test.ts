import { describe, expect, it } from 'vitest'

import { assertVocabularyIdAvailable } from './assert-vocabulary-id-available'
import { expectHttpError } from '../../test/expect-http-error'

describe('assertVocabularyIdAvailable', () => {
  it('passes for a new campaign id', () => {
    expect(() =>
      assertVocabularyIdAvailable({
        id: 'robot',
        systemIds: new Set(['humanoid']),
        campaignIds: new Set(),
      }),
    ).not.toThrow()
  })

  it('rejects ids that shadow system seed entries', () => {
    expectHttpError(
      () =>
        assertVocabularyIdAvailable({
          id: 'humanoid',
          systemIds: new Set(['humanoid']),
          campaignIds: new Set(),
        }),
      409,
    )
  })

  it('rejects duplicate campaign ids in the same set', () => {
    expectHttpError(
      () =>
        assertVocabularyIdAvailable({
          id: 'robot',
          systemIds: new Set(['humanoid']),
          campaignIds: new Set(['robot']),
        }),
      409,
    )
  })
})
