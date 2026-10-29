import { describe, expect, it } from 'vitest'

import { equipmentSchema, type Equipment } from '../../content/equipment'
import type { MagicPropertyDefinitionProvider } from '../../content/equipment/instance/magic-property'
import { dexModifierForArmor, resolveCreatureArmorSlot } from '../creature/armor-class'
import { resolvedField, unavailableField } from './derived-field'
import { resolveMonsterArmorClass, type MonsterArmorClassResolution } from './armor-class'

const RULESET = 'srd-cc-5.2.1'

function armor(input: {
  slug: string
  name: string
  category: 'light' | 'medium' | 'heavy' | 'shields'
  baseAcOffset?: number
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
    ...(input.baseAcOffset !== undefined ? { baseAcOffset: input.baseAcOffset } : {}),
    ...(input.acBonus !== undefined ? { acBonus: input.acBonus } : {}),
    stealthDisadvantage: false,
  })
}

const leather = armor({
  slug: 'leather-armor',
  name: 'Leather armor',
  category: 'light',
  baseAcOffset: 1,
})
const chainShirt = armor({
  slug: 'chain-shirt',
  name: 'Chain shirt',
  category: 'medium',
  baseAcOffset: 3,
})
const chainMail = armor({
  slug: 'chain-mail',
  name: 'Chain mail',
  category: 'heavy',
  baseAcOffset: 6,
})
const halfPlate = armor({
  slug: 'half-plate',
  name: 'Half plate',
  category: 'medium',
  baseAcOffset: 5,
})
const shield = armor({
  slug: 'shield',
  name: 'Shield',
  category: 'shields',
  acBonus: 2,
})

const catalog = new Map(
  [leather, chainShirt, chainMail, halfPlate, shield].map((item) => [item.id, item]),
)

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
  options: {
    equipped?: boolean
    propertyId?: string
    adjustment?: number
    quantity?: number
    entryId?: string
  } = {},
) {
  return {
    entryId: options.entryId ?? item.slug,
    equipmentId: item.id,
    quantity: options.quantity ?? 1,
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
  /** Absolute AC under the chosen ascending base. Converted to an offset. */
  fixedValue?: number
  equipment?: ReturnType<typeof entry>[]
  acBase?: 9 | 10
  provider?: MagicPropertyDefinitionProvider
}) {
  const base = input.acBase ?? 10
  return resolveMonsterArmorClass({
    monster: {
      abilityScores: input.dex === undefined ? {} : { dex: input.dex },
      armorClass: {
        ...(input.naturalArmorBonus !== undefined
          ? { naturalArmorBonus: input.naturalArmorBonus }
          : {}),
        ...(input.fixedValue !== undefined ? { fixedAcOffset: input.fixedValue - base } : {}),
      },
      equipment: input.equipment ?? [],
    },
    equipmentCatalog: catalog,
    armorClassRules: { mode: 'ascending', base },
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
      alternatives: resolvedField([]),
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
    expect(ac.alternatives).toEqual(
      resolvedField([{ source: 'armor', label: 'Leather armor', ac: 13 }]),
    )
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
    expect(ac.alternatives).toEqual(
      resolvedField([{ source: 'natural', label: 'Natural armor', ac: 13 }]),
    )
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
    expect(naturalWins.alternatives).toEqual(
      resolvedField([{ source: 'armor', label: 'Leather armor', ac: 17 }]),
    )

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
      calculatedAc: resolvedField(15),
    })
    expect(overridden.alternatives).toEqual(
      resolvedField([{ source: 'natural', label: 'Natural armor', ac: 15 }]),
    )

    const open = resolved({
      dex: 14,
      equipment: [entry(leather)],
    })
    expect(open.calculatedAc).toBeUndefined()
    expect(open.ac).toBe(13)
  })

  it('reports owned armor conflicts before a fixed override', () => {
    expect(
      resolve({
        dex: 14,
        equipment: [entry(leather), entry(chainShirt)],
      }),
    ).toEqual({ status: 'unavailable', reason: 'conflict' })
    expect(
      resolve({
        dex: 14,
        equipment: [
          entry(shield, { entryId: 'shield-a' }),
          entry(shield, { entryId: 'shield-b', equipped: false }),
        ],
      }),
    ).toEqual({ status: 'unavailable', reason: 'conflict' })
    expect(
      resolve({
        dex: 14,
        naturalArmorBonus: 2,
        fixedValue: 18,
        equipment: [entry(leather, { quantity: 2 })],
      }),
    ).toEqual({ status: 'unavailable', reason: 'conflict' })
    expect(
      resolve({
        dex: 14,
        fixedValue: 18,
        equipment: [entry(leather), entry(chainShirt, { equipped: false })],
      }),
    ).toEqual({ status: 'unavailable', reason: 'conflict' })
    expect(resolved({ dex: 14, naturalArmorBonus: 2 }).ac).toBe(14)
    expect(resolve({ equipment: [] })).toEqual({ status: 'unavailable', reason: 'missing-input' })
    expect(resolve({ fixedValue: 12 }).status).toBe('resolved')
    expect(resolved({ fixedValue: 12 }).calculatedAc).toBeUndefined()
    expect(resolved({ fixedValue: 12 }).dexRestriction).toBeUndefined()
    expect(resolved({ dex: 14, equipment: [entry(leather), entry(shield)] }).ac).toBe(15)
  })

  it('records when a medium cap is why natural armor wins, including the shared shield', () => {
    const ac = resolved({
      dex: 18,
      naturalArmorBonus: 2,
      equipment: [entry(chainShirt), entry(shield)],
    })
    expect(ac.source).toBe('natural')
    expect(ac.ac).toBe(18)
    expect(ac.alternatives).toEqual(
      resolvedField([{ source: 'armor', label: 'Chain shirt', ac: 17 }]),
    )
    expect(ac.dexRestriction).toEqual({
      mode: 'capped',
      abilityModifier: 4,
      appliedModifier: 2,
      maxBonus: 2,
      affectsOutcome: true,
    })
  })

  it('treats an equal unrestricted armor body as changing the winner', () => {
    const ac = resolved({
      dex: 18,
      naturalArmorBonus: 3,
      equipment: [entry(chainShirt), entry(shield)],
    })
    expect(ac.ac).toBe(19)
    expect(ac.alternatives).toEqual(
      resolvedField([{ source: 'armor', label: 'Chain shirt', ac: 17 }]),
    )
    expect(ac.dexRestriction?.affectsOutcome).toBe(true)
  })

  it('omits the restriction when natural armor still wins with full DEX', () => {
    const ac = resolved({
      dex: 18,
      naturalArmorBonus: 3,
      equipment: [entry(leather)],
    })
    expect(ac.source).toBe('natural')
    expect(ac.ac).toBe(17)
    expect(ac.dexRestriction).toBeUndefined()
  })

  it('does not mark the outcome when capped armor already wins', () => {
    const ac = resolved({ dex: 18, equipment: [entry(chainShirt)] })
    expect(ac.source).toBe('armor')
    expect(ac.ac).toBe(15)
    expect(ac.dexRestriction).toMatchObject({
      mode: 'capped',
      abilityModifier: 4,
      appliedModifier: 2,
      affectsOutcome: false,
    })
  })

  it('does not mark the outcome when DEX is inside the cap, zero, or negative', () => {
    expect(
      resolved({ dex: 12, naturalArmorBonus: 5, equipment: [entry(chainShirt)] }).dexRestriction,
    ).toMatchObject({ abilityModifier: 1, appliedModifier: 1, affectsOutcome: false })
    expect(
      resolved({ dex: 10, naturalArmorBonus: 2, equipment: [entry(chainShirt)] }).dexRestriction,
    ).toMatchObject({ abilityModifier: 0, appliedModifier: 0, affectsOutcome: false })
    expect(
      resolved({ dex: 8, naturalArmorBonus: 4, equipment: [entry(chainShirt)] }).dexRestriction,
    ).toMatchObject({ abilityModifier: -1, appliedModifier: -1, affectsOutcome: false })
  })

  it('marks ignored positive DEX on heavy armor and ignores a negative modifier', () => {
    const positive = resolved({
      dex: 18,
      naturalArmorBonus: 5,
      equipment: [entry(chainMail)],
    })
    expect(positive.source).toBe('natural')
    expect(positive.dexRestriction).toEqual({
      mode: 'none',
      abilityModifier: 4,
      appliedModifier: 0,
      affectsOutcome: true,
    })

    const negative = resolved({
      dex: 8,
      naturalArmorBonus: 8,
      equipment: [entry(chainMail)],
    })
    expect(negative.source).toBe('natural')
    expect(negative.dexRestriction).toMatchObject({
      mode: 'none',
      abilityModifier: -1,
      appliedModifier: 0,
      affectsOutcome: false,
    })
  })

  it('keeps an armor enhancement inside the armor body when the cap changes the winner', () => {
    const ac = resolved({
      dex: 18,
      naturalArmorBonus: 3,
      equipment: [entry(chainShirt, { adjustment: 1 })],
    })
    expect(ac.ac).toBe(17)
    expect(ac.alternatives).toEqual(
      resolvedField([{ source: 'armor', label: 'Chain shirt', ac: 16 }]),
    )
    expect(ac.rows.some((row) => row.kind === 'enhancement')).toBe(false)
    expect(ac.dexRestriction?.affectsOutcome).toBe(true)
  })

  it('shares the character armor contribution for medium armor, DEX +4, and a +1 enhancement', () => {
    if (halfPlate.kind !== 'armor') throw new Error('expected armor')
    expect(dexModifierForArmor(4, halfPlate)).toBe(2)
    const ac = resolved({
      dex: 18,
      equipment: [entry(halfPlate, { adjustment: 1 })],
    })
    expect(ac.source).toBe('armor')
    expect(ac.ac).toBe(18)
    expect(ac.rows).toContainEqual({ kind: 'dex', value: 2, cap: 2 })
  })

  it('drops the restriction on a fixed override and on unequipped armor', () => {
    const overridden = resolved({
      dex: 18,
      naturalArmorBonus: 2,
      fixedValue: 20,
      equipment: [entry(chainShirt), entry(shield)],
    })
    expect(overridden).toMatchObject({
      source: 'fixed',
      ac: 20,
      calculatedAc: resolvedField(18),
    })
    expect(overridden.dexRestriction).toBeUndefined()
    expect(overridden.alternatives).toEqual(
      resolvedField([{ source: 'armor', label: 'Chain shirt', ac: 17 }]),
    )

    const stowed = resolved({
      dex: 18,
      naturalArmorBonus: 2,
      equipment: [entry(chainShirt, { equipped: false })],
    })
    expect(stowed.bodyArmor).toBeUndefined()
    expect(stowed.dexRestriction).toBeUndefined()
  })

  it('treats an equipped missing catalog item as a missing armor reference', () => {
    const missing = resolveMonsterArmorClass({
      monster: {
        abilityScores: { dex: 14 },
        armorClass: {},
        equipment: [{ entryId: 'gone', equipmentId: 'missing-armor', quantity: 1, equipped: true }],
      },
      equipmentCatalog: catalog,
      armorClassRules: { mode: 'ascending', base: 10 },
      magicPropertyProvider: emptyProvider,
    })

    expect(missing).toEqual(unavailableField('missing-reference'))

    const stowed = resolved({
      dex: 14,
      equipment: [
        {
          entryId: 'stowed-missing',
          equipmentId: 'missing-armor',
          quantity: 1,
          equipped: false,
        } as ReturnType<typeof entry>,
      ],
    })
    expect(stowed.ac).toBe(12)
    expect(stowed.source).toBe('unarmored')
  })

  it('keeps a fixed override when an equipped armor reference is missing', () => {
    const overridden = resolveMonsterArmorClass({
      monster: {
        abilityScores: { dex: 14 },
        armorClass: { fixedAcOffset: 6 },
        equipment: [{ entryId: 'gone', equipmentId: 'missing-armor', quantity: 1, equipped: true }],
      },
      equipmentCatalog: catalog,
      armorClassRules: { mode: 'ascending', base: 10 },
      magicPropertyProvider: emptyProvider,
    })

    expect(overridden.status).toBe('resolved')
    if (overridden.status !== 'resolved') return
    expect(overridden.value.ac).toBe(16)
    expect(overridden.value.alternatives).toEqual(unavailableField('missing-reference'))
    expect(overridden.value.calculatedAc).toEqual(unavailableField('missing-reference'))
  })
})
