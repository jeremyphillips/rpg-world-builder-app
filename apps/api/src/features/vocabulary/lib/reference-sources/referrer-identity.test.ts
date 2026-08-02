import { describe, expect, it } from 'vitest'

import {
  vocabularyReferrerIdentityFromBlocker,
  vocabularyReferrerIdentityKey,
  vocabularyReferrerIdentityKeyFromBlocker,
} from './referrer-identity'

describe('vocabularyReferrerIdentityKey', () => {
  it('builds stable content keys', () => {
    expect(
      vocabularyReferrerIdentityKey({
        kind: 'content',
        contentTypeKey: 'species',
        id: 'sp_1',
      }),
    ).toBe('content:species:sp_1')
  })

  it('builds stable character keys', () => {
    expect(
      vocabularyReferrerIdentityKey({
        kind: 'character',
        id: 'char_1',
      }),
    ).toBe('character:char_1')
  })
})

describe('vocabularyReferrerIdentityFromBlocker', () => {
  it('maps content blockers', () => {
    expect(
      vocabularyReferrerIdentityFromBlocker({
        kind: 'content',
        contentTypeKey: 'spells',
        id: 'spell_1',
        label: 'Fireball',
        slug: 'fireball',
      }),
    ).toEqual({
      kind: 'content',
      contentTypeKey: 'spells',
      id: 'spell_1',
    })
  })

  it('maps character usage blockers', () => {
    expect(
      vocabularyReferrerIdentityKeyFromBlocker({
        kind: 'usage',
        usage: {
          kind: 'character',
          id: 'char_1',
          label: 'Aria',
          characterType: 'pc',
        },
      }),
    ).toBe('character:char_1')
  })
})
