import { describe, expect, it } from 'vitest'

import {
  availableStartingEquipmentOptions,
  isStartingEquipmentOptionAvailable,
} from './starting-equipment-availability'

describe('isStartingEquipmentOptionAvailable', () => {
  it('treats omitted and true as available', () => {
    expect(isStartingEquipmentOptionAvailable({})).toBe(true)
    expect(isStartingEquipmentOptionAvailable({ available: true })).toBe(true)
  })

  it('treats false as unavailable', () => {
    expect(isStartingEquipmentOptionAvailable({ available: false })).toBe(false)
  })
})

describe('availableStartingEquipmentOptions', () => {
  it('filters unavailable packages', () => {
    const options = [
      { id: 'standard-equipment', available: true },
      { id: 'starting-gold', available: false },
      { id: 'alt-package' },
    ]

    expect(availableStartingEquipmentOptions(options).map((option) => option.id)).toEqual([
      'standard-equipment',
      'alt-package',
    ])
  })
})
