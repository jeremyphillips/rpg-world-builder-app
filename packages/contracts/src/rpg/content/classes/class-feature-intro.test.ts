import { describe, expect, it } from 'vitest'

import { classBodyFeatureSchema, subclassFeatureSchema } from './class'

describe('class feature intro', () => {
  it('parses class and subclass features without intro', () => {
    const base = {
      id: 'feature-1',
      kind: 'custom' as const,
      name: 'Feature',
      level: 1,
    }
    expect(classBodyFeatureSchema.safeParse(base).success).toBe(true)
    expect(subclassFeatureSchema.safeParse(base).success).toBe(true)
  })

  it('parses intro only on spellcasting features', () => {
    const parsed = classBodyFeatureSchema.parse({
      id: 'spellcasting',
      kind: 'spellcasting',
      name: 'Spellcasting',
      level: 1,
      intro: '<p>Flavor</p>',
    })
    expect(parsed.kind === 'spellcasting' && parsed.intro).toBe('<p>Flavor</p>')
  })

  it('strips intro from custom features', () => {
    const parsed = classBodyFeatureSchema.parse({
      id: 'feature-1',
      kind: 'custom',
      name: 'Feature',
      level: 1,
      intro: '<p>Flavor</p>',
    })
    expect(parsed.kind).toBe('custom')
    expect('intro' in parsed).toBe(false)
  })
})
