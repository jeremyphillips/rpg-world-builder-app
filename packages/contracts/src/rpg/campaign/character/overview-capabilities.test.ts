import { describe, expect, it } from 'vitest'

import {
  CHARACTER_OVERVIEW_CAPABILITIES,
  supportsCharacterBulkRosterStatus,
} from './overview-capabilities'

describe('CHARACTER_OVERVIEW_CAPABILITIES', () => {
  it('defines capabilities for each overview kind', () => {
    for (const kind of ['npc', 'pc'] as const) {
      expect(CHARACTER_OVERVIEW_CAPABILITIES[kind]).toBeDefined()
    }
  })

  it('enables bulk roster status only for npc overview', () => {
    expect(supportsCharacterBulkRosterStatus('npc')).toBe(true)
    expect(supportsCharacterBulkRosterStatus('pc')).toBe(false)
  })
})
