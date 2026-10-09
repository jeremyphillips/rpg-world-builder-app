import { describe, expect, it } from 'vitest'

import { mapSpellPickerCompactSummaryToMetadataLines } from './map-spell-picker-compact-summary-to-metadata-lines'

describe('mapSpellPickerCompactSummaryToMetadataLines', () => {
  it('maps curated groups onto one metadata line, including ritual and concentration', () => {
    expect(
      mapSpellPickerCompactSummaryToMetadataLines({
        groups: [
          { kind: 'classification', levelLabel: '1st-level', schoolLabel: 'Divination' },
          { kind: 'ritual', label: 'Ritual' },
          { kind: 'castingTime', label: 'Action' },
          { kind: 'concentration', label: 'Concentration 10 min' },
        ],
      }),
    ).toEqual([
      {
        segments: [
          {
            type: 'text',
            text: '1st-level Divination',
            parts: [
              { text: '1st-level', emphasis: 'strong' },
              { text: 'Divination', emphasis: 'default' },
            ],
          },
          { type: 'text', text: 'Ritual' },
          { type: 'text', text: 'Action' },
          { type: 'text', text: 'Concentration 10 min' },
        ],
      },
    ])
  })
})
