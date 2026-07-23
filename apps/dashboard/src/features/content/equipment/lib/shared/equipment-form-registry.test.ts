import { describe, expect, it } from 'vitest'
import type { EquipmentKind } from '@rpg/contracts'

import {
  allRegisteredKindFieldGroups,
  fieldGroupsForEquipmentKind,
  kindFieldGroups,
} from './equipment-form-registry'

describe('kindFieldGroups', () => {
  it('registers service field group', () => {
    const groups = fieldGroupsForEquipmentKind('service')
    expect(groups).toHaveLength(1)
    expect(groups?.[0]).toMatchObject({ kind: 'group', legend: '' })
  })

  it('registers mount field group', () => {
    const groups = fieldGroupsForEquipmentKind('mount')
    expect(groups).toHaveLength(1)
    expect(groups?.[0]).toMatchObject({ kind: 'group', legend: '' })
  })

  it('registers tool field group', () => {
    const groups = fieldGroupsForEquipmentKind('tool')
    expect(groups).toHaveLength(2)
    expect(groups?.[0]).toMatchObject({ kind: 'group', legend: '' })
    expect(groups?.[1]).toMatchObject({
      kind: 'array',
      name: 'utilizes',
      legend: 'Utilize actions',
    })
  })

  it('registers magic item field group', () => {
    const groups = fieldGroupsForEquipmentKind('magic_item')
    expect(groups).toHaveLength(1)
    expect(groups?.[0]).toMatchObject({ kind: 'group', legend: '' })
  })

  it('registers adventuring gear field group', () => {
    const groups = fieldGroupsForEquipmentKind('adventuring_gear')
    expect(groups).toHaveLength(1)
    expect(groups?.[0]).toMatchObject({
      kind: 'group',
      legend: '',
      chrome: { variant: 'panel' },
    })
  })

  it('registers vehicle field group', () => {
    const groups = fieldGroupsForEquipmentKind('vehicle')
    expect(groups).toHaveLength(1)
    expect(groups?.[0]).toMatchObject({ kind: 'group', legend: '' })
  })

  it('registers armor field group', () => {
    const groups = fieldGroupsForEquipmentKind('armor')
    expect(groups).toHaveLength(1)
    expect(groups?.[0]).toMatchObject({
      kind: 'group',
      legend: '',
      chrome: { variant: 'panel' },
    })
  })

  it('registers weapon field group', () => {
    const groups = fieldGroupsForEquipmentKind('weapon')
    expect(groups).toHaveLength(1)
    expect(groups?.[0]).toMatchObject({
      kind: 'group',
      legend: '',
      chrome: { variant: 'panel' },
    })
  })

  it('allRegisteredKindFieldGroups includes every registered kind', () => {
    const registeredKinds = Object.keys(kindFieldGroups) as EquipmentKind[]
    const expectedLength = registeredKinds.reduce(
      (total, kind) => total + kindFieldGroups[kind]!().length,
      0,
    )
    expect(allRegisteredKindFieldGroups()).toHaveLength(expectedLength)
  })
})
