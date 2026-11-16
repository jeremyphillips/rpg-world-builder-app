import { describe, expect, it } from 'vitest'

import { creatureFormSizesDiffer, resolveCreatureFormStatistics } from './forms'

describe('creature form size resolution', () => {
  it('uses only the base sizes or the nested alternate override', () => {
    expect(resolveCreatureFormStatistics({ sizes: ['medium'] })).toEqual({ sizes: ['medium'] })
    expect(
      resolveCreatureFormStatistics(
        { sizes: ['medium'] },
        { overrides: { sizes: ['small', 'tiny'] } },
      ),
    ).toEqual({ sizes: ['small', 'tiny'] })
  })

  it('compares size sets independently of their order', () => {
    expect(creatureFormSizesDiffer(['small', 'medium'], ['medium', 'small'])).toBe(false)
    expect(creatureFormSizesDiffer(['small'], ['medium'])).toBe(true)
  })
})
