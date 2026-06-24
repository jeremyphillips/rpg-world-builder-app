import { describe, expect, it } from 'vitest'
import type { ServiceEquipment } from '@rpg/contracts'

import { shouldShowEquipmentFamilyMismatch } from './equipment-family-route-guard'

const serviceItem = { kind: 'service' } as ServiceEquipment

describe('shouldShowEquipmentFamilyMismatch', () => {
  it('is false while loading', () => {
    expect(shouldShowEquipmentFamilyMismatch(serviceItem, 'weapon', true, false)).toBe(false)
  })

  it('is false when kinds match', () => {
    expect(shouldShowEquipmentFamilyMismatch(serviceItem, 'service', false, false)).toBe(false)
  })

  it('is true when loaded entity kind disagrees with the route family', () => {
    expect(shouldShowEquipmentFamilyMismatch(serviceItem, 'weapon', false, false)).toBe(true)
  })
})
