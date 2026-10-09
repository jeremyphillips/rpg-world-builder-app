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

  it('joins mixed-emphasis parts with a space inside one metadata item', () => {
    expect(
      formatCatalogMetadataLines([
        {
          segments: [
            {
              type: 'text',
              text: 'ignored when parts are present',
              parts: [
                { text: '1st-level', emphasis: 'strong' },
                { text: 'Evocation', emphasis: 'default' },
              ],
            },
            { type: 'text', text: 'Action' },
          ],
        },
      ]),
    ).toBe('1st-level Evocation · Action')
  })
})
