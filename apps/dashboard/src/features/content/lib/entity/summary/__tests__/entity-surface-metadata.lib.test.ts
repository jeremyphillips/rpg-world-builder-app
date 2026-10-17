import { describe, expect, it } from 'vitest'

import {
  entitySurfaceMetadataFromText,
  entitySurfaceMetadataLine,
} from '../entity-surface-metadata.lib'

describe('entitySurfaceMetadataLine', () => {
  it('drops empty segments and returns undefined when nothing remains', () => {
    expect(entitySurfaceMetadataLine(['', '  '])).toBeUndefined()
    expect(entitySurfaceMetadataLine(['Simple', 'Melee'])).toEqual(['Simple', 'Melee'])
  })

  it('normalizes single-segment text helpers', () => {
    expect(entitySurfaceMetadataFromText('  Located in Dock Ward  ')).toEqual([
      'Located in Dock Ward',
    ])
    expect(entitySurfaceMetadataFromText('')).toBeUndefined()
  })
})
