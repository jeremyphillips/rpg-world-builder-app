import { describe, expect, it } from 'vitest'
import { ORGANIZATION_AUTHORING_PRESET_IDS, ORGANIZATION_AUTHORING_PRESETS } from '@rpg/contracts'

import { presetMatchesIntentionalQuery } from './organization-preset-intentional-matcher'

function normalizePresetLabel(label: string): string {
  return label.trim().toLowerCase()
}

describe('organization preset discovery ownership', () => {
  it('does not keep another preset label in discoveryTerms', () => {
    const failures: string[] = []

    for (const id of ORGANIZATION_AUTHORING_PRESET_IDS) {
      const label = normalizePresetLabel(ORGANIZATION_AUTHORING_PRESETS[id].label)
      for (const otherId of ORGANIZATION_AUTHORING_PRESET_IDS) {
        if (otherId === id) continue
        const other = ORGANIZATION_AUTHORING_PRESETS[otherId]
        const terms = 'discoveryTerms' in other ? (other.discoveryTerms ?? []) : []
        for (const term of terms) {
          if (normalizePresetLabel(term) === label) {
            failures.push(`${otherId} discoveryTerm "${term}" equals ${id} label`)
          }
        }
      }
    }

    expect(failures, failures.join('\n')).toEqual([])
  })

  it('blocks breadth-v1 collisions that previously stole direct preset labels', () => {
    expect(presetMatchesIntentionalQuery('army', ORGANIZATION_AUTHORING_PRESETS.army, 'Navy')).toBe(
      false,
    )
    expect(
      presetMatchesIntentionalQuery('army', ORGANIZATION_AUTHORING_PRESETS.army, 'Militia'),
    ).toBe(false)
    expect(
      presetMatchesIntentionalQuery('army', ORGANIZATION_AUTHORING_PRESETS.army, 'Pirate crew'),
    ).toBe(false)
    expect(
      presetMatchesIntentionalQuery(
        'academy',
        ORGANIZATION_AUTHORING_PRESETS.academy,
        'University',
      ),
    ).toBe(false)
    expect(
      presetMatchesIntentionalQuery(
        'trading_company',
        ORGANIZATION_AUTHORING_PRESETS.trading_company,
        'Merchant house',
      ),
    ).toBe(false)
    expect(
      presetMatchesIntentionalQuery(
        'gang',
        ORGANIZATION_AUTHORING_PRESETS.gang,
        'Protection racket',
      ),
    ).toBe(false)
    expect(
      presetMatchesIntentionalQuery(
        'smuggling_ring',
        ORGANIZATION_AUTHORING_PRESETS.smuggling_ring,
        'Fencing network',
      ),
    ).toBe(false)
    expect(
      presetMatchesIntentionalQuery(
        'church',
        ORGANIZATION_AUTHORING_PRESETS.church,
        'Druid circle',
      ),
    ).toBe(false)
    expect(
      presetMatchesIntentionalQuery(
        'academy',
        ORGANIZATION_AUTHORING_PRESETS.academy,
        'Mage college',
      ),
    ).toBe(false)
  })
})
