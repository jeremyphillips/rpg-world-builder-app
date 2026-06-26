import { describe, expect, it } from 'vitest'

import { HttpError } from '../../lib/http-error'
import { assertVocabularyIdAvailable } from './assert-vocabulary-id-available'

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
    try {
      assertVocabularyIdAvailable({
        id: 'humanoid',
        systemIds: new Set(['humanoid']),
        campaignIds: new Set(),
      })
      throw new Error('expected to throw')
    } catch (err) {
      expect(err).toBeInstanceOf(HttpError)
      expect((err as HttpError).status).toBe(409)
    }
  })

  it('rejects duplicate campaign ids in the same set', () => {
    try {
      assertVocabularyIdAvailable({
        id: 'robot',
        systemIds: new Set(['humanoid']),
        campaignIds: new Set(['robot']),
      })
      throw new Error('expected to throw')
    } catch (err) {
      expect(err).toBeInstanceOf(HttpError)
      expect((err as HttpError).status).toBe(409)
    }
  })
})
