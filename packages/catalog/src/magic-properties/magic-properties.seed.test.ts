import { describe, expect, it } from 'vitest'

import { createMagicPropertyDefinitionProvider, loadSeedMagicProperties } from './index'

describe('magic properties seed', () => {
  it('loads nine enhancement presets for srd-cc-5.2.1', () => {
    const rows = loadSeedMagicProperties('srd-cc-5.2.1')
    expect(rows).toHaveLength(9)
    expect(rows.every((row) => row.category === 'enhancement')).toBe(true)
  })

  it('resolves presets by id through the provider', () => {
    const provider = createMagicPropertyDefinitionProvider('srd-cc-5.2.1')
    expect(provider('srd-cc-5.2.1:weapon-enhancement-1')?.name).toBe('Enhancement +1')
    expect(provider('missing-id')).toBeUndefined()
  })
})
