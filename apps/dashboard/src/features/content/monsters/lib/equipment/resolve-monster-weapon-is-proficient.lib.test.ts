import { describe, expect, it } from 'vitest'

import { pickArmor, pickEquipment } from '@/test/fixtures/pick'

import {
  resolveMonsterLoadoutEquipmentIsProficient,
  resolveMonsterWeaponIsProficient,
} from './resolve-monster-weapon-is-proficient.lib'

describe('resolveMonsterWeaponIsProficient', () => {
  it('covers individual weapon grants', () => {
    const dagger = pickEquipment('dagger')
    expect(resolveMonsterWeaponIsProficient(dagger, { categories: [], items: [dagger.id] })).toBe(
      true,
    )
    expect(resolveMonsterWeaponIsProficient(dagger, { categories: [], items: [] })).toBe(false)
  })

  it('covers category grants for martial weapons', () => {
    const greataxe = pickEquipment('greataxe')
    expect(resolveMonsterWeaponIsProficient(greataxe, { categories: ['martial'], items: [] })).toBe(
      true,
    )
  })
})

describe('resolveMonsterLoadoutEquipmentIsProficient', () => {
  it('treats non-weapons as proficient regardless of grants', () => {
    const plate = pickArmor('plate-armor')
    expect(resolveMonsterLoadoutEquipmentIsProficient(plate, { categories: [], items: [] })).toBe(
      true,
    )
  })

  it('evaluates weapons against the grant set', () => {
    const greataxe = pickEquipment('greataxe')
    expect(
      resolveMonsterLoadoutEquipmentIsProficient(greataxe, { categories: [], items: [] }),
    ).toBe(false)
  })
})
