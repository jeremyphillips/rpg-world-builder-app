import { describe, expect, it } from 'vitest'

import { formatCatalogPickerMetadataLines } from './format-catalog-picker-metadata-lines'

describe('formatCatalogPickerMetadataLines', () => {
  it('joins segment text into a readable summary string', () => {
    expect(
      formatCatalogPickerMetadataLines([
        {
          segments: [
            { type: 'text', text: '1d8 Slashing' },
            { type: 'text', text: 'Versatile' },
          ],
        },
      ]),
    ).toBe('1d8 Slashing · Versatile')
  })
})
