import { describe, expect, it } from 'vitest'

import {
  allRegisteredKindFieldGroups,
  fieldGroupsForEquipmentKind,
  kindFieldGroups,
} from './equipment-form-registry'

describe('kindFieldGroups', () => {
  it('registers service field group', () => {
    const groups = fieldGroupsForEquipmentKind('service')
    expect(groups).toHaveLength(1)
    expect(groups?.[0]).toMatchObject({ kind: 'group', legend: 'Service' })
  })

  it('registers mount field group', () => {
    const groups = fieldGroupsForEquipmentKind('mount')
    expect(groups).toHaveLength(1)
    expect(groups?.[0]).toMatchObject({ kind: 'group', legend: 'Mount' })
  })

  it('registers tool field group', () => {
    const groups = fieldGroupsForEquipmentKind('tool')
    expect(groups).toHaveLength(1)
    expect(groups?.[0]).toMatchObject({ kind: 'group', legend: 'Tool' })
  })

  it('registers magic item field group', () => {
    const groups = fieldGroupsForEquipmentKind('magic_item')
    expect(groups).toHaveLength(1)
    expect(groups?.[0]).toMatchObject({ kind: 'group', legend: 'Magic Item' })
  })

  it('registers adventuring gear field group', () => {
    const groups = fieldGroupsForEquipmentKind('adventuring_gear')
    expect(groups).toHaveLength(1)
    expect(groups?.[0]).toMatchObject({ kind: 'group', legend: 'Adventuring Gear' })
  })

  it('registers vehicle field group', () => {
    const groups = fieldGroupsForEquipmentKind('vehicle')
    expect(groups).toHaveLength(1)
    expect(groups?.[0]).toMatchObject({ kind: 'group', legend: 'Vehicle' })
  })

  it('registers armor field group', () => {
    const groups = fieldGroupsForEquipmentKind('armor')
    expect(groups).toHaveLength(1)
    expect(groups?.[0]).toMatchObject({ kind: 'group', legend: 'Armor' })
  })

  it('returns undefined for kinds still in the monolith', () => {
    expect(fieldGroupsForEquipmentKind('weapon')).toBeUndefined()
  })

  it('allRegisteredKindFieldGroups includes every registered kind', () => {
    const registeredKinds = Object.keys(kindFieldGroups)
    expect(allRegisteredKindFieldGroups()).toHaveLength(registeredKinds.length)
  })
})
