import { describe, expect, it } from 'vitest'

import { armorBodySchema } from '../../../content/equipment'
import {
  bodyArmorAc,
  dexModifierForArmor,
  resolveEquippedArmorClass,
  shieldAcBonus,
} from './armor-class'

const leatherArmor = armorBodySchema.parse({
  id: 'srd-cc-5.2.1:leather-armor',
  slug: 'leather-armor',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Leather Armor',
  description: '',
  cost: { amount: 10, currency: 'gp' },
  weight: { value: 10, unit: 'lb' },
  kind: 'armor',
  category: 'light',
  baseAc: 11,
  addDexModifier: true,
  stealthDisadvantage: false,
})

const chainMail = armorBodySchema.parse({
  id: 'srd-cc-5.2.1:chain-mail',
  slug: 'chain-mail',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Chain Mail',
  description: '',
  cost: { amount: 75, currency: 'gp' },
  weight: { value: 55, unit: 'lb' },
  kind: 'armor',
  category: 'heavy',
  baseAc: 16,
  addDexModifier: false,
  stealthDisadvantage: true,
})

const halfPlate = armorBodySchema.parse({
  id: 'srd-cc-5.2.1:half-plate',
  slug: 'half-plate',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Half Plate',
  description: '',
  cost: { amount: 750, currency: 'gp' },
  weight: { value: 40, unit: 'lb' },
  kind: 'armor',
  category: 'medium',
  baseAc: 15,
  addDexModifier: true,
  maxDexBonus: 2,
  stealthDisadvantage: true,
})

const shield = armorBodySchema.parse({
  id: 'srd-cc-5.2.1:shield',
  slug: 'shield',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Shield',
  description: '',
  cost: { amount: 10, currency: 'gp' },
  weight: { value: 6, unit: 'lb' },
  kind: 'armor',
  category: 'shields',
  acBonus: 2,
  addDexModifier: false,
  stealthDisadvantage: false,
})

describe('dexModifierForArmor', () => {
  it('caps medium armor DEX bonus', () => {
    expect(dexModifierForArmor(4, halfPlate)).toBe(2)
  })

  it('returns zero for heavy armor and shields', () => {
    expect(dexModifierForArmor(3, chainMail)).toBe(0)
    expect(dexModifierForArmor(3, shield)).toBe(0)
  })
})

describe('bodyArmorAc', () => {
  it('adds full DEX to light armor', () => {
    expect(bodyArmorAc(leatherArmor, 2)).toBe(13)
  })

  it('ignores DEX on heavy armor', () => {
    expect(bodyArmorAc(chainMail, 3)).toBe(16)
  })
})

describe('shieldAcBonus', () => {
  it('returns the shield bonus', () => {
    expect(shieldAcBonus(shield)).toBe(2)
  })
})

describe('resolveEquippedArmorClass', () => {
  it('uses unarmored AC plus shield when no body armor is equipped', () => {
    expect(
      resolveEquippedArmorClass({
        acBase: 10,
        dexModifier: 2,
        equippedArmor: [shield],
      }),
    ).toBe(14)
  })

  it('combines body armor, capped DEX, and shield bonus', () => {
    expect(
      resolveEquippedArmorClass({
        acBase: 10,
        dexModifier: 3,
        equippedArmor: [halfPlate, shield],
      }),
    ).toBe(19)
  })

  it('derives druid standard package AC from leather and shield', () => {
    expect(
      resolveEquippedArmorClass({
        acBase: 10,
        dexModifier: 2,
        equippedArmor: [leatherArmor, shield],
      }),
    ).toBe(15)
  })
})
