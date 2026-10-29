import { describe, expect, it } from 'vitest'

import { armorBodySchema } from '../../../content/equipment'
import { toEquippedArmorPiece } from '../../creature/armor-class'
import {
  bodyArmorAc,
  dexModifierForArmor,
  resolveArmorDexContribution,
  resolveEquippedArmorClass,
  shieldAcBonus,
} from './armor-class'

const leatherArmor = armorBodySchema.parse({
  id: 'srd-cc-5.2.1:leather-armor',
  slug: 'leather-armor',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  status: 'published',
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
  stealthDisadvantage: false,
})

const chainMail = armorBodySchema.parse({
  id: 'srd-cc-5.2.1:chain-mail',
  slug: 'chain-mail',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  status: 'published',
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
  stealthDisadvantage: true,
})

const halfPlate = armorBodySchema.parse({
  id: 'srd-cc-5.2.1:half-plate',
  slug: 'half-plate',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  status: 'published',
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
  stealthDisadvantage: true,
})

const shield = armorBodySchema.parse({
  id: 'srd-cc-5.2.1:shield',
  slug: 'shield',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  status: 'published',
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
  stealthDisadvantage: false,
})

const leatherPiece = toEquippedArmorPiece(leatherArmor)
const chainMailPiece = toEquippedArmorPiece(chainMail)
const halfPlatePiece = toEquippedArmorPiece(halfPlate)
const shieldPiece = toEquippedArmorPiece(shield)

describe('dexModifierForArmor', () => {
  it('adds the full DEX modifier for light armor, including zero and negative', () => {
    expect(resolveArmorDexContribution(3, leatherArmor)).toEqual({
      abilityModifier: 3,
      appliedModifier: 3,
      rule: { mode: 'full' },
    })
    expect(resolveArmorDexContribution(0, leatherArmor)).toMatchObject({
      abilityModifier: 0,
      appliedModifier: 0,
      rule: { mode: 'full' },
    })
    expect(resolveArmorDexContribution(-1, leatherArmor)).toMatchObject({
      abilityModifier: -1,
      appliedModifier: -1,
      rule: { mode: 'full' },
    })
  })

  it('caps medium armor at +2 and still applies a smaller or negative modifier', () => {
    expect(resolveArmorDexContribution(1, halfPlate)).toMatchObject({
      abilityModifier: 1,
      appliedModifier: 1,
      rule: { mode: 'capped', maxBonus: 2 },
    })
    expect(resolveArmorDexContribution(2, halfPlate).appliedModifier).toBe(2)
    expect(resolveArmorDexContribution(4, halfPlate)).toEqual({
      abilityModifier: 4,
      appliedModifier: 2,
      rule: { mode: 'capped', maxBonus: 2 },
    })
    expect(resolveArmorDexContribution(-1, halfPlate).appliedModifier).toBe(-1)
  })

  it('ignores positive and negative DEX on heavy armor and shields', () => {
    expect(resolveArmorDexContribution(3, chainMail)).toEqual({
      abilityModifier: 3,
      appliedModifier: 0,
      rule: { mode: 'none' },
    })
    expect(resolveArmorDexContribution(-2, chainMail)).toMatchObject({
      abilityModifier: -2,
      appliedModifier: 0,
      rule: { mode: 'none' },
    })
    expect(dexModifierForArmor(3, shield)).toBe(0)
    expect(dexModifierForArmor(-2, shield)).toBe(0)
  })

  it('matches the monster contribution for medium armor, DEX +4, and a +1 enhancement', () => {
    const piece = toEquippedArmorPiece(halfPlate, [{ kind: 'armor_class', bonus: 1 }])
    expect(dexModifierForArmor(4, halfPlate)).toBe(2)
    expect(bodyArmorAc(piece, 4)).toBe(18)
  })
})

describe('bodyArmorAc', () => {
  it('adds full DEX to light armor', () => {
    expect(bodyArmorAc(leatherPiece, 2)).toBe(13)
  })

  it('ignores DEX on heavy armor', () => {
    expect(bodyArmorAc(chainMailPiece, 3)).toBe(16)
  })
})

describe('shieldAcBonus', () => {
  it('returns the shield bonus', () => {
    expect(shieldAcBonus(shieldPiece)).toBe(2)
  })
})

describe('resolveEquippedArmorClass', () => {
  it('uses unarmored AC plus shield when no body armor is equipped', () => {
    expect(
      resolveEquippedArmorClass({
        acBase: 10,
        dexModifier: 2,
        equippedArmor: [shieldPiece],
      }),
    ).toBe(14)
  })

  it('combines body armor, capped DEX, and shield bonus', () => {
    expect(
      resolveEquippedArmorClass({
        acBase: 10,
        dexModifier: 3,
        equippedArmor: [halfPlatePiece, shieldPiece],
      }),
    ).toBe(19)
  })

  it('derives druid standard package AC from leather and shield', () => {
    expect(
      resolveEquippedArmorClass({
        acBase: 10,
        dexModifier: 2,
        equippedArmor: [leatherPiece, shieldPiece],
      }),
    ).toBe(15)
  })
})
