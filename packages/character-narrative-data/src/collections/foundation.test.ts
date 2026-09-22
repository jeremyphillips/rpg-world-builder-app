import { NARRATIVE_SLOTS, NARRATIVE_THEMES } from '@rpg/contracts/character-narrative'
import { describe, expect, it } from 'vitest'

import { foundationCollection } from './foundation'

describe('foundation narrative collection', () => {
  it('loads validated authored fragments', () => {
    expect(foundationCollection.fragments.length).toBeGreaterThan(80)
  })

  it('provides enough fallback fragments per theme and slot', () => {
    for (const theme of NARRATIVE_THEMES) {
      for (const slot of NARRATIVE_SLOTS) {
        const fallbackCount = foundationCollection.fragments.filter(
          (fragment) =>
            fragment.fallback && fragment.themeIds.includes(theme) && fragment.slot === slot,
        ).length
        const required = slot === 'personalityTraits' ? 2 : 1
        expect(fallbackCount).toBeGreaterThanOrEqual(required)
      }
    }
  })
})
