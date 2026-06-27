import { describe, expect, it } from 'vitest'

import type { CampaignCreateValues } from '../../lib/campaign-settings-values'
import { buildFlavorRows, buildIdentityRows, buildRulesRows } from './review-step.lib'

describe('review-step row builders', () => {
  it('builds identity rows with optional description and banner', () => {
    const file = new File(['x'], 'banner.png', { type: 'image/png' })
    const rows = buildIdentityRows({
      name: 'Curse of Strahd',
      description: 'Gothic horror',
      banner: [file],
    })

    expect(rows).toEqual([
      { label: 'Name', value: 'Curse of Strahd' },
      { label: 'Description', value: 'Gothic horror' },
      { label: 'Image', value: 'banner.png' },
    ])
  })

  it('builds rules rows with fallbacks and advanced fields', () => {
    const rows = buildRulesRows({
      startingLevel: 3,
      maxCharacterLevel: 20,
      allowedCharacterCreatureTypes: ['humanoid'],
    } satisfies Partial<CampaignCreateValues>)

    expect(rows[0]).toEqual({ label: 'Starting level', value: '3' })
    expect(rows[1]).toEqual({ label: 'Imported characters', value: '—' })
    expect(rows[2]).toEqual({ label: 'Standard max level', value: '20' })
    expect(rows[3]).toEqual({ label: 'Allowed creature types', value: 'Humanoid' })
  })

  it('builds flavor rows from label maps', () => {
    const rows = buildFlavorRows({
      playStyle: ['sandbox'],
      mood: ['heroic'],
      magicLevel: 'high_magic',
      difficulty: 'dangerous',
    } satisfies Partial<CampaignCreateValues>)

    expect(rows.map((row) => row.value)).toEqual(['Sandbox', 'Heroic', 'High Magic', 'Dangerous'])
  })
})
