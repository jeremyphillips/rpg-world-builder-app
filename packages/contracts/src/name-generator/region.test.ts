import { describe, expect, it } from 'vitest'

import { getNameRegionLabel, NAME_REGION_ENTRIES, NAME_REGION_IDS } from './region'

describe('name region vocabulary', () => {
  it('labels known regions from the closed set', () => {
    expect(NAME_REGION_IDS).toEqual([
      'west-africa',
      'scandinavia',
      'british-isles',
      'east-asia',
      'eastern-europe',
      'mediterranean',
      'near-east',
    ])
    expect(getNameRegionLabel('west-africa')).toBe(NAME_REGION_ENTRIES['west-africa'].label)
    expect(getNameRegionLabel('british-isles')).toBe('British Isles')
  })

  it('falls back to a title-cased slug for unknown regions', () => {
    expect(getNameRegionLabel('custom-coast')).toBe('Custom Coast')
  })
})
