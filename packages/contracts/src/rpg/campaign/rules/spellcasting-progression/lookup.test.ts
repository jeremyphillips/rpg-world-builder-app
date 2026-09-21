import { describe, expect, it } from 'vitest'

import { resolveGainQuotaThroughLevel, resolveProgressionValueAtLevel } from './lookup'

describe('spellcasting progression lookup', () => {
  it('treats missing gain rows as zero within authored range', () => {
    const rows = [
      { level: 1, count: 6 },
      { level: 2, count: 2 },
      { level: 4, count: 3 },
    ]

    expect(
      resolveProgressionValueAtLevel({
        kind: 'gain',
        rows,
        level: 3,
        extension: 'zero',
      }).count,
    ).toBe(0)
  })

  it('accumulates wizard-style 6+2 gain through level 20', () => {
    const rows = [{ level: 1, count: 6 }]
    for (let level = 2; level <= 20; level += 1) {
      rows.push({ level, count: 2 })
    }

    expect(
      resolveGainQuotaThroughLevel({
        rows,
        level: 20,
        extension: 'zero',
      }).count,
    ).toBe(6 + 19 * 2)
  })

  it('adds zero gain beyond authored range when extension is zero', () => {
    const rows = [{ level: 1, count: 6 }]
    for (let level = 2; level <= 20; level += 1) {
      rows.push({ level, count: 2 })
    }

    const at20 = resolveGainQuotaThroughLevel({ rows, level: 20, extension: 'zero' }).count
    const at21 = resolveGainQuotaThroughLevel({ rows, level: 21, extension: 'zero' }).count

    expect(at21).toBe(at20)
  })
})
