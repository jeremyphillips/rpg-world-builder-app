import { describe, expect, it } from 'vitest'

import {
  availableStartingEquipmentOptions,
  findAvailableStartingEquipmentOption,
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

describe('findAvailableStartingEquipmentOption', () => {
  const options = [
    { id: 'standard-equipment', available: true, label: 'Standard', items: [] },
    { id: 'starting-gold', available: false, label: 'Gold', items: [] },
    { id: 'alt-package', label: 'Alt', items: [] },
  ]

  it('returns available rows by id', () => {
    expect(findAvailableStartingEquipmentOption(options, 'standard-equipment')?.id).toBe(
      'standard-equipment',
    )
    expect(findAvailableStartingEquipmentOption(options, 'alt-package')?.id).toBe('alt-package')
  })

  it('returns undefined for unavailable or missing ids', () => {
    expect(findAvailableStartingEquipmentOption(options, 'starting-gold')).toBeUndefined()
    expect(findAvailableStartingEquipmentOption(options, 'missing')).toBeUndefined()
  })
})
