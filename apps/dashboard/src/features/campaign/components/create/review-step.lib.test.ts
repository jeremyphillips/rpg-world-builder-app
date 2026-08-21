import { describe, expect, it } from 'vitest'

import type { CampaignCreateValues } from '../../lib/settings/campaign-settings-form-values'
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

  it('builds rules rows with fallbacks for create-wizard fields only', () => {
    const rows = buildRulesRows({
      startingLevel: 3,
      importedCharactersPolicy: 'approval_required',
    } satisfies Partial<CampaignCreateValues>)

    expect(rows).toEqual([
      { label: 'Starting level', value: '3' },
      { label: 'Imported characters', value: 'Yes, with DM approval' },
    ])
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
