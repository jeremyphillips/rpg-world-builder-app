import { describe, expect, it } from 'vitest'

import { formatCatalogMetadataLines } from './format-catalog-metadata-lines'

describe('formatCatalogMetadataLines', () => {
  it('joins text segments within and across lines', () => {
    expect(
      formatCatalogMetadataLines([
        {
          segments: [
            { type: 'text', text: 'Action' },
            { type: 'text', text: 'Self' },
          ],
        },
        {
          segments: [{ type: 'text', text: '1st level' }],
        },
      ]),
    ).toBe('Action · Self · 1st level')
  })
})
