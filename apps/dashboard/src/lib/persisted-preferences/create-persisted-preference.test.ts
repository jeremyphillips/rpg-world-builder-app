/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from 'vitest'

import { createPersistedPreference } from './create-persisted-preference'

type TestPreferences = {
  version: 1
  flag: boolean
  count?: number
}

describe('createPersistedPreference', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('persists and hydrates validated payloads', () => {
    const store = createPersistedPreference<1, TestPreferences, Omit<TestPreferences, 'version'>>({
      key: 'rpg:test-preference:v1',
      version: 1,
      defaults: { flag: false },
      validatePayload: (raw) => {
        if (typeof raw.flag !== 'boolean') return null
        const count = typeof raw.count === 'number' ? raw.count : undefined
        return { flag: raw.flag, ...(count !== undefined ? { count } : {}) }
      },
    })

    store.persist({ version: 1, flag: true, count: 3 })

    expect(store.hydrate()).toEqual({ version: 1, flag: true, count: 3 })
  })

  it('falls back to defaults for malformed JSON and invalid payloads', () => {
    const store = createPersistedPreference<1, TestPreferences, Omit<TestPreferences, 'version'>>({
      key: 'rpg:test-preference:v1',
      version: 1,
      defaults: { flag: false },
      validatePayload: (raw) => (typeof raw.flag === 'boolean' ? { flag: raw.flag } : null),
    })

    localStorage.setItem('rpg:test-preference:v1', '{not-json')
    expect(store.hydrate()).toEqual({ version: 1, flag: false })

    localStorage.setItem('rpg:test-preference:v1', JSON.stringify({ version: 2, flag: true }))
    expect(store.hydrate()).toEqual({ version: 1, flag: false })

    localStorage.setItem('rpg:test-preference:v1', JSON.stringify({ version: 1, flag: 'yes' }))
    expect(store.hydrate()).toEqual({ version: 1, flag: false })
  })
})
