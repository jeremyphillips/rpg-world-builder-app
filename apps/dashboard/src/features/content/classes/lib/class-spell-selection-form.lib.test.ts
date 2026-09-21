import { describe, expect, it } from 'vitest'

import {
  alignProgressionToModel,
  detectRegularGain,
  formatRegularGainSummary,
  materializeRegularGain,
} from './class-spell-selection-form.lib'

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

  it('materializeRegularGain round-trips with detectRegularGain', () => {
    const materialized = materializeRegularGain({ starting: 6, perLevel: 2, throughLevel: 20 })
    expect(detectRegularGain(materialized)).toEqual({
      starting: 6,
      perLevel: 2,
      throughLevel: 20,
    })
    expect(materialized.extension).toBe('zero')
    expect(materialized.curve.rows).toHaveLength(20)
  })

  it('formats regular gain with an explicit endpoint', () => {
    expect(formatRegularGainSummary({ starting: 6, perLevel: 2, throughLevel: 20 })).toBe(
      'Start with 6 · Gain 2 each level through level 20',
    )
  })

  it('formats irregular gain with change-level count', () => {
    expect(
      formatRegularGainSummary({
        acquisition: {
          curve: {
            rows: [
              { level: 1, count: 6 },
              { level: 2, count: 2 },
              { level: 4, count: 3 },
            ],
          },
          extension: 'zero',
        },
      }),
    ).toBe('Spell acquisition varies by class level · 3 change levels')
  })

  it('alignProgressionToModel moves repertoire to prepared for prepare-from-list', () => {
    const aligned = alignProgressionToModel('prepareFromClassList', {
      repertoire: { curve: { rows: [{ level: 1, count: 2 }] }, extension: 'carryForward' },
    })

    expect(aligned?.preparedSpells?.curve.rows).toEqual([{ level: 1, count: 2 }])
    expect(aligned?.repertoire).toBeUndefined()
  })

  it('alignProgressionToModel moves prepared to repertoire for limited repertoire', () => {
    const aligned = alignProgressionToModel('limitedRepertoire', {
      preparedSpells: { curve: { rows: [{ level: 1, count: 4 }] }, extension: 'carryForward' },
    })

    expect(aligned?.repertoire?.curve.rows).toEqual([{ level: 1, count: 4 }])
    expect(aligned?.preparedSpells).toBeUndefined()
  })
})
