import { describe, expect, it } from 'vitest'

import { resolveEquipmentNotProficientShortLabel } from '@rpg/contracts'

import { pickArmor, pickEquipment } from '@/test/fixtures/pick'

import { resolveEquipmentNotProficientCompatibilityStatus } from './resolve-equipment-not-proficient-compatibility-status.lib'

describe('resolveEquipmentNotProficientCompatibilityStatus', () => {
  it('returns a warning badge when not proficient with a weapon', () => {
    const greataxe = pickEquipment('greataxe')
    expect(resolveEquipmentNotProficientCompatibilityStatus(greataxe, false)).toEqual([
      {
        kind: 'badge',
        label: resolveEquipmentNotProficientShortLabel(),
        tone: 'warning',
        appearance: 'soft',
        title: 'Not proficient with this weapon',
      },
    ])
  })

  it('returns no badges when proficient', () => {
    expect(resolveEquipmentNotProficientCompatibilityStatus(pickEquipment('dagger'), true)).toEqual(
      [],
    )
  })

  it('returns no badges for gear without an advisory class', () => {
    expect(
      resolveEquipmentNotProficientCompatibilityStatus(pickEquipment('rations'), false),
    ).toEqual([])
  })

  it('can emit armor advisory copy when not proficient', () => {
    const plate = pickArmor('plate-armor')
    const badges = resolveEquipmentNotProficientCompatibilityStatus(plate, false)
    expect(badges).toHaveLength(1)
    expect(badges[0]).toMatchObject({
      kind: 'badge',
      label: resolveEquipmentNotProficientShortLabel(),
      title: 'Not proficient with this armor',
    })
  })
})
