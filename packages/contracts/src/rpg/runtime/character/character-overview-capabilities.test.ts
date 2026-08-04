import { describe, expect, it } from 'vitest'

import {
  CHARACTER_OVERVIEW_KINDS,
  CHARACTER_OVERVIEW_CAPABILITIES,
  supportsCharacterBulkRosterStatus,
} from './character-overview-capabilities'

describe('CHARACTER_OVERVIEW_CAPABILITIES', () => {
  it('defines a capability entry for every overview kind', () => {
    for (const kind of CHARACTER_OVERVIEW_KINDS) {
      expect(CHARACTER_OVERVIEW_CAPABILITIES[kind]).toBeDefined()
    }
  })

  it('enables bulk roster status only for NPC overviews', () => {
    expect(supportsCharacterBulkRosterStatus('npc')).toBe(true)
    expect(supportsCharacterBulkRosterStatus('pc')).toBe(false)
  })
})
