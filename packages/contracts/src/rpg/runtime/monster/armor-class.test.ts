import { describe, expect, it } from 'vitest'

import { equipmentSchema, type Equipment } from '../../content/equipment'
import type { MagicPropertyDefinitionProvider } from '../../content/equipment/instance/magic-property'
import { resolveCreatureArmorSlot } from '../creature/armor-class'
import { resolveMonsterArmorClass, type MonsterArmorClassResolution } from './armor-class'

const RULESET = 'srd-cc-5.2.1'

function armor(input: {
  slug: string
  name: string
  category: 'light' | 'medium' | 'heavy' | 'shields'
  baseAc?: number
  acBonus?: number
  addDexModifier: boolean
  maxDexBonus?: number
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
    addDexModifier: input.addDexModifier,
    ...(input.maxDexBonus !== undefined ? { maxDexBonus: input.maxDexBonus } : {}),
    stealthDisadvantage: false,
  })
}

const leather = armor({
  slug: 'leather-armor',
  name: 'Leather armor',
  category: 'light',
  baseAc: 11,
  addDexModifier: true,
})
const chainShirt = armor({
  slug: 'chain-shirt',
  name: 'Chain shirt',
  category: 'medium',
  baseAc: 13,
  addDexModifier: true,
  maxDexBonus: 2,
})
const chainMail = armor({
  slug: 'chain-mail',
  name: 'Chain mail',
  category: 'heavy',
  baseAc: 16,
  addDexModifier: false,
})
const shield = armor({
  slug: 'shield',
  name: 'Shield',
  category: 'shields',
  acBonus: 2,
  addDexModifier: false,
})

const catalog = new Map([leather, chainShirt, chainMail, shield].map((item) => [item.id, item]))

const armorEnhancement: MagicPropertyDefinitionProvider = (id) =>
  id === `${RULESET}:armor-enhancement-1`
    ? {
        id,
        name: 'Armor +1',
        description: 'test',
        category: 'enhancement',
        appliesTo: ['armor'],
        effects: [{ target: 'armor_class', bonus: 1 }],
      }
    : id === `${RULESET}:shield-enhancement-1`
      ? {
          id,
          name: 'Shield +1',
          description: 'test',
          category: 'enhancement',
          appliesTo: ['shield'],
          effects: [{ target: 'armor_class', bonus: 1 }],
        }
      : undefined

const emptyProvider: MagicPropertyDefinitionProvider = () => undefined

function entry(
  item: Equipment,
  options: { equipped?: boolean; propertyId?: string; adjustment?: number } = {},
) {
  return {
    entryId: item.slug,
    equipmentId: item.id,
    quantity: 1,
    equipped: options.equipped ?? true,
    ...(options.propertyId
      ? {
          magical: true,
          magicProperties: [{ kind: 'preset' as const, propertyId: options.propertyId }],
        }
      : {}),
    ...(options.adjustment !== undefined
      ? {
          adjustments: [
            { effectId: 'ac', target: 'armor_class' as const, bonus: options.adjustment },
          ],
        }
      : {}),
  }
}

function resolve(input: {
  dex?: number
  naturalArmorBonus?: number
  fixedValue?: number
  equipment?: ReturnType<typeof entry>[]
  acBase?: 9 | 10
  provider?: MagicPropertyDefinitionProvider
}) {
  return resolveMonsterArmorClass({
    monster: {
      abilityScores: input.dex === undefined ? {} : { dex: input.dex },
      armorClass: {
        ...(input.naturalArmorBonus !== undefined
          ? { naturalArmorBonus: input.naturalArmorBonus }
          : {}),
        ...(input.fixedValue !== undefined ? { fixedValue: input.fixedValue } : {}),
      },
      equipment: input.equipment ?? [],
    },
    equipmentCatalog: catalog,
    acBase: input.acBase ?? 10,
    magicPropertyProvider: input.provider ?? emptyProvider,
  })
}

function resolved(input: Parameters<typeof resolve>[0]): MonsterArmorClassResolution {
  const result = resolve(input)
  if (result.status !== 'resolved') throw new Error(result.reason)
  return result.value
}

describe('resolveCreatureArmorSlot', () => {
  it('classifies body armor and shields and ignores other items', () => {
    expect(resolveCreatureArmorSlot(leather)).toBe('body-armor')
    expect(resolveCreatureArmorSlot(shield)).toBe('shield')
    expect(resolveCreatureArmorSlot(undefined)).toBeUndefined()
  })
})

describe('resolveMonsterArmorClass', () => {
  it('uses the ruleset base plus Dexterity when nothing else applies', () => {
    const ac = resolved({ dex: 14 })
    expect(ac).toMatchObject({
      ac: 12,
      source: 'unarmored',
      rows: [
        { kind: 'ruleset-base', value: 10 },
        { kind: 'dex', value: 2 },
      ],
      alternatives: [],
    })
    expect(resolved({ dex: 10, acBase: 9 }).ac).toBe(9)
    expect(resolved({ dex: 10, acBase: 10 }).ac).toBe(10)
  })

  it('keeps a Dexterity row for +0 and negative modifiers', () => {
    expect(resolved({ dex: 10 }).rows).toContainEqual({ kind: 'dex', value: 0 })
    expect(resolved({ dex: 8 })).toMatchObject({
      ac: 9,
      rows: [
        { kind: 'ruleset-base', value: 10 },
        { kind: 'dex', value: -1 },
      ],
    })
  })

  it('adds a natural armor bonus and reports the lower armor alternative', () => {
    const ac = resolved({
      dex: 14,
      naturalArmorBonus: 4,
      equipment: [entry(leather)],
    })
    expect(ac.source).toBe('natural')
    expect(ac.ac).toBe(16)
    expect(ac.rows).toEqual([
      { kind: 'ruleset-base', value: 10 },
      { kind: 'dex', value: 2 },
      { kind: 'natural', value: 4 },
    ])
    expect(ac.alternatives).toEqual([{ source: 'armor', label: 'Leather armor', ac: 13 }])
    expect(ac.bodyArmor).toEqual({ entryId: 'leather-armor', label: 'Leather armor' })
  })

  it('lets armor win, including a full, capped, or omitted Dexterity row', () => {
    expect(resolved({ dex: 18, equipment: [entry(leather)] })).toMatchObject({
      ac: 15,
      source: 'armor',
      rows: [
        { kind: 'armor-base', entryId: 'leather-armor', label: 'Leather armor', value: 11 },
        { kind: 'dex', value: 4 },
      ],
    })
    expect(resolved({ dex: 18, equipment: [entry(chainShirt)] }).rows).toContainEqual({
      kind: 'dex',
      value: 2,
      cap: 2,
    })
    const heavy = resolved({ dex: 18, equipment: [entry(chainMail)] })
    expect(heavy.ac).toBe(16)
    expect(heavy.rows.some((row) => row.kind === 'dex')).toBe(false)
  })

  it('breaks a tie in favor of armor', () => {
    const ac = resolved({
      dex: 14,
      naturalArmorBonus: 1,
      equipment: [entry(leather)],
    })
    expect(ac.source).toBe('armor')
    expect(ac.ac).toBe(13)
    expect(ac.alternatives).toEqual([{ source: 'natural', label: 'Natural armor', ac: 13 }])
  })

  it('applies an armor enhancement only when armor wins, and always applies a shield enhancement', () => {
    const naturalWins = resolved({
      dex: 14,
      naturalArmorBonus: 4,
      provider: armorEnhancement,
      equipment: [
        entry(leather, { propertyId: `${RULESET}:armor-enhancement-1` }),
        entry(shield, { propertyId: `${RULESET}:shield-enhancement-1` }),
      ],
    })
    expect(naturalWins.ac).toBe(19)
    expect(naturalWins.source).toBe('natural')
    expect(naturalWins.rows).toEqual([
      { kind: 'ruleset-base', value: 10 },
      { kind: 'dex', value: 2 },
      { kind: 'natural', value: 4 },
      { kind: 'shield', entryId: 'shield', label: 'Shield', value: 2 },
      {
        kind: 'enhancement',
        target: 'shield',
        entryId: 'shield',
        label: 'Shield +1',
        value: 1,
      },
    ])
    expect(naturalWins.alternatives).toEqual([{ source: 'armor', label: 'Leather armor', ac: 17 }])

    const armorWins = resolved({
      dex: 14,
      naturalArmorBonus: 1,
      provider: armorEnhancement,
      equipment: [entry(leather, { propertyId: `${RULESET}:armor-enhancement-1` })],
    })
    expect(armorWins.ac).toBe(14)
    expect(armorWins.rows).toContainEqual({
      kind: 'enhancement',
      target: 'armor',
      entryId: 'leather-armor',
      label: 'Armor +1',
      value: 1,
    })
  })

  it('adds one equipped shield and ignores unequipped armor', () => {
    const worn = resolved({
      dex: 14,
      equipment: [entry(leather), entry(shield)],
    })
    expect(worn.ac).toBe(15)
    expect(worn.shield).toEqual({ entryId: 'shield', label: 'Shield' })

    const stowed = resolved({
      dex: 14,
      equipment: [entry(chainMail, { equipped: false })],
    })
    expect(stowed).toMatchObject({ ac: 12, source: 'unarmored' })
    expect(stowed.bodyArmor).toBeUndefined()
  })

  it('replaces the total with a fixed override and keeps the calculated value', () => {
    const overridden = resolved({
      dex: 14,
      naturalArmorBonus: 1,
      fixedValue: 17,
      equipment: [entry(leather), entry(shield)],
    })
    expect(overridden).toMatchObject({
      ac: 17,
      source: 'fixed',
      rows: [{ kind: 'fixed', value: 17 }],
      calculatedAc: 15,
    })
    expect(overridden.alternatives).toEqual([{ source: 'natural', label: 'Natural armor', ac: 15 }])

    const open = resolved({
      dex: 14,
      equipment: [entry(leather)],
    })
    expect(open.calculatedAc).toBeUndefined()
    expect(open.ac).toBe(13)
  })

  it('reports equipped armor conflicts and missing Dexterity without an override', () => {
    expect(
      resolve({
        dex: 14,
        equipment: [entry(leather), entry(chainShirt)],
      }),
    ).toEqual({ status: 'unavailable', reason: 'conflict' })
    expect(
      resolve({
        dex: 14,
        equipment: [entry(shield), entry(shield)],
      }),
    ).toEqual({ status: 'unavailable', reason: 'conflict' })
    expect(resolve({ equipment: [] })).toEqual({ status: 'unavailable', reason: 'missing-input' })
    expect(resolve({ fixedValue: 12 }).status).toBe('resolved')
    expect(resolved({ fixedValue: 12 }).calculatedAc).toBeUndefined()
  })
})
