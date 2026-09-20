import { describe, expect, it } from 'vitest'

import { detectRegularGain, formatRegularGainSummary } from './class-spell-selection-form.lib'

describe('class-spell-selection-form.lib', () => {
  it('detects regular wizard-style gain through level 20', () => {
    const rows = [{ level: 1, count: 6 }]
    for (let level = 2; level <= 20; level += 1) {
      rows.push({ level, count: 2 })
    }

    expect(detectRegularGain({ curve: { rows }, extension: 'zero' })).toEqual({
      starting: 6,
      perLevel: 2,
      throughLevel: 20,
    })
  })

  it('returns null for irregular sparse gain', () => {
    expect(
      detectRegularGain({
        curve: {
          rows: [
            { level: 1, count: 6 },
            { level: 2, count: 2 },
            { level: 4, count: 3 },
          ],
        },
        extension: 'zero',
      }),
    ).toBeNull()
  })

  it('formats regular gain with an explicit endpoint', () => {
    const rows = [{ level: 1, count: 6 }]
    for (let level = 2; level <= 20; level += 1) {
      rows.push({ level, count: 2 })
    }

    expect(formatRegularGainSummary({ curve: { rows }, extension: 'zero' })).toBe(
      'Start with 6 · Gain 2 each level through level 20',
    )
  })

  it('formats irregular gain with change-level count', () => {
    expect(
      formatRegularGainSummary({
        curve: {
          rows: [
            { level: 1, count: 6 },
            { level: 2, count: 2 },
            { level: 4, count: 3 },
          ],
        },
        extension: 'zero',
      }),
    ).toBe('Spell acquisition varies by class level · 3 change levels')
  })
})
