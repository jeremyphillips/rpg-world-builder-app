import { describe, expect, it } from 'vitest'

import {
  equipmentSchema,
  resolveMonsterArmorClass,
  type Equipment,
  type MonsterArmorClassResolution,
} from '@rpg/contracts'

import {
  monsterArmorClassAlternativeMessages,
  monsterArmorClassBreakdownRows,
  monsterArmorClassCaption,
  monsterArmorClassCompactLabel,
  monsterArmorClassDexAdvisory,
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
      'Chain mail wins: 18 vs. 15 with natural armor.',
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
    ).toEqual(['Natural armor wins: 15 vs. 14 with studded leather.'])
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
    expect(
      monsterArmorClassAlternativeMessages({
        ...resolution,
        alternatives: [{ source: 'natural', label: 'Natural armor', ac: 15 }],
        dexRestriction: {
          mode: 'capped',
          abilityModifier: 4,
          appliedModifier: 2,
          maxBonus: 2,
          affectsOutcome: true,
        },
      }),
    ).toEqual([`Calculated ${monsterArmorClassCompactLabel()} without override: 18`])
    expect(monsterArmorClassDexAdvisory(resolution)).toBeUndefined()
  })

  it('names both totals on a tie, with natural armor first', () => {
    expect(
      monsterArmorClassAlternativeMessages({
        ac: 18,
        source: 'armor',
        rows: [],
        alternatives: [{ source: 'natural', label: 'Natural armor', ac: 18 }],
        bodyArmor: { entryId: 'leather', label: 'Studded Leather' },
      }),
    ).toEqual(['Natural armor and studded leather both provide 18.'])
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

const RULESET = 'srd-cc-5.2.1'

function armorItem(input: {
  slug: string
  name: string
  category: 'light' | 'medium' | 'heavy' | 'shields'
  baseAc?: number
  acBonus?: number
}): Equipment {
  return equipmentSchema.parse({
    id: `${RULESET}:${input.slug}`,
    slug: input.slug,
    rulesetId: RULESET,
    source: 'system',
    campaignId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    name: input.name,
    description: '',
    cost: { amount: 1, currency: 'gp' },
    weight: { value: 1, unit: 'lb' },
    kind: 'armor',
    category: input.category,
    ...(input.baseAc !== undefined ? { baseAc: input.baseAc } : {}),
    ...(input.acBonus !== undefined ? { acBonus: input.acBonus } : {}),
    stealthDisadvantage: false,
  })
}

function resolvedAc(input: {
  dex: number
  naturalArmorBonus?: number
  fixedValue?: number
  equipment: Equipment[]
  equipped?: boolean
}): MonsterArmorClassResolution {
  const result = resolveMonsterArmorClass({
    monster: {
      abilityScores: { dex: input.dex },
      armorClass: {
        ...(input.naturalArmorBonus !== undefined
          ? { naturalArmorBonus: input.naturalArmorBonus }
          : {}),
        ...(input.fixedValue !== undefined ? { fixedValue: input.fixedValue } : {}),
      },
      equipment: input.equipment.map((item) => ({
        entryId: item.slug,
        equipmentId: item.id,
        quantity: 1,
        equipped: input.equipped ?? true,
      })),
    },
    equipmentCatalog: new Map(input.equipment.map((item) => [item.id, item])),
    acBase: 10,
    magicPropertyProvider: () => undefined,
  })
  if (result.status !== 'resolved') throw new Error(result.reason)
  return result.value
}

describe('monster armor class comparison from the resolver', () => {
  const scaleMail = armorItem({
    slug: 'scale-mail',
    name: 'Scale Mail',
    category: 'medium',
    baseAc: 14,
  })
  const chainMail = armorItem({
    slug: 'chain-mail',
    name: 'Chain Mail',
    category: 'heavy',
    baseAc: 16,
  })
  const leather = armorItem({
    slug: 'leather-armor',
    name: 'Leather Armor',
    category: 'light',
    baseAc: 11,
  })

  it('shows the comparison and the DEX advisory when the cap changes the winner', () => {
    const resolution = resolvedAc({
      dex: 18,
      naturalArmorBonus: 3,
      equipment: [scaleMail],
    })
    expect(monsterArmorClassAlternativeMessages(resolution)).toEqual([
      'Natural armor wins: 17 vs. 16 with scale mail.',
    ])
    expect(monsterArmorClassDexAdvisory(resolution)).toBe(
      'Scale mail limits the +4 DEX modifier to +2.',
    )
  })

  it('names heavy armor when ignored DEX changes the winner', () => {
    const resolution = resolvedAc({
      dex: 18,
      naturalArmorBonus: 5,
      equipment: [chainMail],
    })
    expect(monsterArmorClassDexAdvisory(resolution)).toBe('Chain mail ignores the +4 DEX modifier.')
  })

  it('stays silent for unarmored full DEX, a fixed override, and unequipped armor', () => {
    const armorWins = resolvedAc({ dex: 18, equipment: [leather] })
    expect(monsterArmorClassAlternativeMessages(armorWins)).toEqual([])
    expect(monsterArmorClassDexAdvisory(armorWins)).toBeUndefined()

    const fullDex = resolvedAc({ dex: 18, naturalArmorBonus: 3, equipment: [leather] })
    expect(monsterArmorClassDexAdvisory(fullDex)).toBeUndefined()
    expect(monsterArmorClassAlternativeMessages(fullDex)).toEqual([
      'Natural armor wins: 17 vs. 15 with leather armor.',
    ])

    const fixed = resolvedAc({
      dex: 18,
      naturalArmorBonus: 3,
      fixedValue: 20,
      equipment: [scaleMail],
    })
    expect(monsterArmorClassAlternativeMessages(fixed)).toEqual([
      `Calculated ${monsterArmorClassCompactLabel()} without override: 17`,
    ])
    expect(monsterArmorClassDexAdvisory(fixed)).toBeUndefined()

    const stowed = resolvedAc({
      dex: 18,
      naturalArmorBonus: 3,
      equipment: [scaleMail],
      equipped: false,
    })
    expect(monsterArmorClassAlternativeMessages(stowed)).toEqual([])
    expect(monsterArmorClassDexAdvisory(stowed)).toBeUndefined()
  })

  it('hides the DEX advisory when armor still wins or the restriction does not change the winner', () => {
    const cappedWins = resolvedAc({ dex: 18, equipment: [scaleMail] })
    expect(cappedWins.dexRestriction?.affectsOutcome).toBe(false)
    expect(monsterArmorClassDexAdvisory(cappedWins)).toBeUndefined()

    const heavyWins = resolvedAc({ dex: 18, equipment: [chainMail] })
    expect(heavyWins.dexRestriction?.affectsOutcome).toBe(false)
    expect(monsterArmorClassDexAdvisory(heavyWins)).toBeUndefined()

    const naturalWinsAnyway = resolvedAc({
      dex: 18,
      naturalArmorBonus: 9,
      equipment: [scaleMail],
    })
    expect(naturalWinsAnyway.dexRestriction?.affectsOutcome).toBe(false)
    expect(monsterArmorClassDexAdvisory(naturalWinsAnyway)).toBeUndefined()
  })
})
