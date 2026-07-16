import { describe, expect, it } from 'vitest'

import { mapSpellPickerCompactSummaryToMetadataLines } from './map-spell-picker-compact-summary-to-metadata-lines'

describe('mapSpellPickerCompactSummaryToMetadataLines', () => {
  it('maps casting summary and classification as muted text metadata', () => {
    expect(
      mapSpellPickerCompactSummaryToMetadataLines({
        castingSummary: ['Action', 'Self', 'Concentration, up to 10 minutes'],
        classification: {
          levelLabel: '1st level',
          descriptors: ['Divination'],
        },
      }),
    ).toEqual([
      {
        segments: [
          { type: 'text', text: 'Action' },
          { type: 'text', text: 'Self' },
          { type: 'text', text: 'Concentration, up to 10 minutes' },
        ],
      },
      {
        segments: [
          { type: 'text', text: '1st level' },
          { type: 'text', text: 'Divination' },
        ],
      },
    ])
  })
})
