import { describe, expect, it } from 'vitest'

import type { MonsterArmorClassResolution } from '@rpg/contracts'

import {
  monsterArmorClassAlternativeMessages,
  monsterArmorClassBreakdownRows,
  monsterArmorClassCaption,
  monsterArmorClassCompactLabel,
} from './monster-armor-class-presentation'

const chainAndShield: MonsterArmorClassResolution = {
  ac: 18,
  source: 'armor',
  rows: [
    { kind: 'armor-base', entryId: 'mail', label: 'Chain mail', value: 16 },
    { kind: 'shield', entryId: 'shield', label: 'Shield', value: 2 },
  ],
  alternatives: [{ source: 'natural', label: 'Natural armor', ac: 15 }],
  bodyArmor: { entryId: 'mail', label: 'Chain mail' },
  shield: { entryId: 'shield', label: 'Shield' },
}

describe('monster armor class presentation', () => {
  it('captions the winning pieces and lists signed breakdown rows', () => {
    expect(monsterArmorClassCaption(chainAndShield)).toBe('Chain mail + Shield')
    expect(monsterArmorClassBreakdownRows(chainAndShield)).toEqual([
      { id: 'armor-base-0', label: 'Chain mail (base)', value: '16' },
      { id: 'shield-1', label: 'Shield', value: '+2' },
    ])
    expect(monsterArmorClassAlternativeMessages(chainAndShield)).toEqual([
      'Chain mail wins. Natural armor: 15.',
    ])
  })

  it('names the winning body source before the losing armor total', () => {
    expect(
      monsterArmorClassAlternativeMessages({
        ac: 15,
        source: 'natural',
        rows: [{ kind: 'natural', value: 2 }],
        alternatives: [{ source: 'armor', label: 'Studded Leather', ac: 14 }],
      }),
    ).toEqual(['Natural armor wins. Studded Leather: 14.'])
  })

  it('omits the wins line when the other candidate is unarmored', () => {
    expect(
      monsterArmorClassAlternativeMessages({
        ac: 14,
        source: 'armor',
        rows: [{ kind: 'armor-base', entryId: 'leather', label: 'Studded Leather', value: 12 }],
        alternatives: [{ source: 'unarmored', label: 'Unarmored', ac: 10 }],
        bodyArmor: { entryId: 'leather', label: 'Studded Leather' },
      }),
    ).toEqual([])
    expect(
      monsterArmorClassCaption({
        ac: 14,
        source: 'armor',
        rows: [],
        alternatives: [{ source: 'unarmored', label: 'Unarmored', ac: 10 }],
        bodyArmor: { entryId: 'leather', label: 'Studded Leather' },
      }),
    ).toBe('Studded Leather')
  })

  it('labels a dex cap and a fixed override separately from the calculated total', () => {
    const resolution: MonsterArmorClassResolution = {
      ac: 17,
      source: 'fixed',
      rows: [{ kind: 'fixed', value: 17 }],
      alternatives: [],
      calculatedAc: 18,
    }
    expect(monsterArmorClassCaption(resolution)).toBe('Fixed override')
    expect(
      monsterArmorClassBreakdownRows({
        ...resolution,
        source: 'armor',
        rows: [{ kind: 'dex', value: 2, cap: 2 }],
      })[0],
    ).toMatchObject({ label: 'DEX modifier (max +2)', value: '+2' })
    expect(monsterArmorClassAlternativeMessages(resolution)).toEqual([
      `Calculated ${monsterArmorClassCompactLabel()} without override: 18`,
    ])
  })

  it('omits zero optional modifiers and keeps a non-zero dex contribution', () => {
    const rows = monsterArmorClassBreakdownRows({
      ac: 16,
      source: 'armor',
      rows: [
        { kind: 'armor-base', entryId: 'plate', label: 'Plate', value: 18 },
        { kind: 'dex', value: 0, cap: 2 },
        { kind: 'natural', value: 0 },
        { kind: 'shield', entryId: 'buckler', label: 'Buckler', value: 0 },
        { kind: 'enhancement', target: 'armor', entryId: 'plate', label: 'Enhancement', value: 0 },
        { kind: 'dex', value: -1 },
      ],
      alternatives: [],
    })
    expect(rows.map((row) => row.label)).toEqual(['Plate (base)', 'DEX modifier'])
    expect(rows[1]).toMatchObject({ value: '-1' })
  })

  it('labels the ruleset base with the armor class compact term', () => {
    const rows = monsterArmorClassBreakdownRows({
      ac: 10,
      source: 'unarmored',
      rows: [{ kind: 'ruleset-base', value: 10 }],
      alternatives: [],
    })
    expect(rows[0]).toMatchObject({ label: `Base ${monsterArmorClassCompactLabel()}` })
    expect(monsterArmorClassCompactLabel()).toBe('AC')
  })
})
