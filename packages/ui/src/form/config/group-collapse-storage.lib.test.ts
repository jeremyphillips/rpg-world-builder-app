/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from 'vitest'

import {
  buildGroupCollapseStorageKey,
  readGroupCollapseOpen,
  slugifyGroupCollapseKey,
  writeGroupCollapseOpen,
} from './group-collapse-storage.lib'

describe('group-collapse-storage.lib', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('builds a stable storage key', () => {
    expect(buildGroupCollapseStorageKey('spell-1', 'target')).toBe(
      'rpg.form.groupCollapse.v1:spell-1:target',
    )
  })

  it('round-trips open state through localStorage', () => {
    writeGroupCollapseOpen('spell-1', 'target', false)
    expect(readGroupCollapseOpen('spell-1', 'target')).toBe(false)
    writeGroupCollapseOpen('spell-1', 'target', true)
    expect(readGroupCollapseOpen('spell-1', 'target')).toBe(true)
  })

  it('slugifies legend text for collapse keys', () => {
    expect(slugifyGroupCollapseKey('How it resolves')).toBe('how-it-resolves')
  })
})
