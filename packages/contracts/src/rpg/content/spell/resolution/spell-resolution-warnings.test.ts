import { describe, expect, it } from 'vitest'

import { FIREBALL_RESOLUTION } from './fixtures'
import { getSpellResolutionAreaMismatchWarning } from './spell-resolution-warnings'

describe('getSpellResolutionAreaMismatchWarning', () => {
  it('returns undefined when only one area is present', () => {
    expect(
      getSpellResolutionAreaMismatchWarning({
        areaOfEffect: { shape: 'sphere', radius: { value: 20, unit: 'ft' } },
      }),
    ).toBeUndefined()
  })

  it('returns undefined when areas match', () => {
    const area = { shape: 'sphere' as const, radius: { value: 20, unit: 'ft' as const } }
    expect(
      getSpellResolutionAreaMismatchWarning({
        areaOfEffect: area,
        resolution: { ...FIREBALL_RESOLUTION, areaOfEffect: area },
      }),
    ).toBeUndefined()
  })

  it('warns when spell-level and resolution areas differ', () => {
    const warning = getSpellResolutionAreaMismatchWarning({
      areaOfEffect: { shape: 'sphere', radius: { value: 20, unit: 'ft' } },
      resolution: {
        ...FIREBALL_RESOLUTION,
        areaOfEffect: { shape: 'sphere', radius: { value: 10, unit: 'ft' } },
      },
    })

    expect(warning?.code).toBe('spell-resolution-area-mismatch')
  })
})
