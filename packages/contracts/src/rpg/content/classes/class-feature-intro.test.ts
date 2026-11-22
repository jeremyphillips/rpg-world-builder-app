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

  it('parses optional intro html', () => {
    const withIntro = {
      id: 'feature-1',
      kind: 'custom' as const,
      name: 'Feature',
      level: 1,
      intro: '<p>Flavor</p>',
    }
    const parsed = classBodyFeatureSchema.parse(withIntro)
    expect(parsed.intro).toBe('<p>Flavor</p>')
  })
})
