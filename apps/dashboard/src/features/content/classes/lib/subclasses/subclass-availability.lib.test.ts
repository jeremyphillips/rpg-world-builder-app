import { describe, expect, it } from 'vitest'

import type { ResolvedSubclass } from '@rpg/contracts'
import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'

import { CHAMPION } from '../../fixtures'
import { buildSubclassAvailabilityPresentations } from './subclass-availability.lib'

describe('buildSubclassAvailabilityPresentations', () => {
  it('builds one shared presentation per list row', () => {
    const listItems = [
      { id: 'sub_a', name: 'Champion', source: 'system' as const, classId: 'class_fighter' },
      { id: 'sub_b', name: 'Battle Master', source: 'homebrew' as const, classId: 'class_fighter' },
    ]
    const subclasses: ResolvedSubclass[] = [
      {
        ...CHAMPION,
        id: 'sub_a',
        name: 'Champion',
        campaignAccess: DEFAULT_CONTENT_CAMPAIGN_ACCESS,
      },
      {
        ...CHAMPION,
        id: 'sub_b',
        name: 'Battle Master',
        source: 'homebrew',
        campaignAccess: DEFAULT_CONTENT_CAMPAIGN_ACCESS,
      },
    ]

    expect(buildSubclassAvailabilityPresentations(listItems, subclasses, { sub_a: false })).toEqual(
      [
        expect.objectContaining({ rowId: 'sub_a', isAvailable: false }),
        expect.objectContaining({ rowId: 'sub_b', isAvailable: true }),
      ],
    )
  })
})
