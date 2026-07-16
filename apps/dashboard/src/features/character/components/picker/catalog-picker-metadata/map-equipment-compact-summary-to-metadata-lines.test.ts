import { describe, expect, it } from 'vitest'

import { mapEquipmentCompactSummaryToMetadataLines } from './map-equipment-compact-summary-to-metadata-lines'

describe('mapEquipmentCompactSummaryToMetadataLines', () => {
  it('maps comparison groups to one text-only line', () => {
    expect(
      mapEquipmentCompactSummaryToMetadataLines({
        kindLabel: 'Weapon',
        comparisonGroups: ['1d4 Piercing', 'Finesse · Light · Thrown'],
      }),
    ).toEqual([
      {
        segments: [
          { type: 'text', text: '1d4 Piercing' },
          { type: 'text', text: 'Finesse · Light · Thrown' },
        ],
      },
    ])
  })

  it('returns no lines when comparison groups are empty', () => {
    expect(
      mapEquipmentCompactSummaryToMetadataLines({
        kindLabel: 'Service',
        comparisonGroups: [],
      }),
    ).toEqual([])
  })
})
