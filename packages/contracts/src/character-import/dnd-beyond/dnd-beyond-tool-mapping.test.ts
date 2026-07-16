import { describe, expect, it } from 'vitest'

import { mapDndBeyondToolSubtype } from './dnd-beyond-tool-mapping'

describe('mapDndBeyondToolSubtype', () => {
  it('maps calligraphers supplies to artisan tool category', () => {
    expect(mapDndBeyondToolSubtype('calligraphers-supplies')).toEqual({
      toolId: 'srd-cc-5.2.1:calligraphers-supplies',
      toolCategory: 'artisan',
    })
  })

  it('maps thieves tools to the thieves category', () => {
    expect(mapDndBeyondToolSubtype('thieves-tools')).toEqual({
      toolId: 'srd-cc-5.2.1:thieves-tools',
      toolCategory: 'thieves',
    })
  })
})
