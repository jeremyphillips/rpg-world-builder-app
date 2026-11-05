import {
  equipmentVariantValidationMessages,
  formatFieldMessage,
  type WeaponEquipment,
} from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { weaponEquipmentFormSchema } from './equipment-form-fields'
import { weaponFormValuesFromEntity } from '../weapons/lib/weapon-form-values'

const longRangeMessage = formatFieldMessage(
  equipmentVariantValidationMessages.longRangeExceedsNormal(),
)

function weaponForm(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Longbow',
    kind: 'weapon' as const,
    hasMarketPrice: false,
    cost: null,
    category: 'martial' as const,
    mode: 'ranged' as const,
    mastery: 'slow' as const,
    ...overrides,
  }
}

function rangeIssue(values: Record<string, unknown>) {
  const parsed = weaponEquipmentFormSchema.safeParse(weaponForm(values))
  if (parsed.success) return undefined
  return parsed.error.issues.find((issue) => issue.path[0] === 'range' && issue.path[1] === 'long')
}

describe('weapon range form schema', () => {
  it('accepts a disadvantage band and a single range', () => {
    expect(
      weaponEquipmentFormSchema.safeParse(weaponForm({ range: { normal: 60, long: 240 } })).success,
    ).toBe(true)
    expect(
      weaponEquipmentFormSchema.safeParse(weaponForm({ range: { normal: 120 } })).success,
    ).toBe(true)
  })

  it('reports equal and reversed ranges on the Long field', () => {
    const equal = rangeIssue({ range: { normal: 30, long: 30 } })
    const reversed = rangeIssue({ range: { normal: 80, long: 30 } })
    expect(formatFieldMessage(equal?.message ?? '')).toBe(longRangeMessage)
    expect(formatFieldMessage(reversed?.message ?? '')).toBe(longRangeMessage)
  })

  it('treats a blank Long as omitted', () => {
    const parsed = weaponEquipmentFormSchema.safeParse(
      weaponForm({ range: { normal: 30, long: '' } }),
    )
    expect(parsed.success).toBe(true)
    if (!parsed.success) return
    expect(parsed.data.range?.long).toBeUndefined()
  })

  it('ignores an invalid range when the range fields are hidden', () => {
    const parsed = weaponEquipmentFormSchema.safeParse(
      weaponForm({ mode: 'melee', mastery: 'sap', range: { normal: 30, long: 10 } }),
    )
    expect(parsed.success).toBe(true)
  })

  it('updates the result when either stored range value changes', () => {
    const stored = weaponFormValuesFromEntity({
      category: 'martial',
      mode: 'ranged',
      mastery: 'slow',
      properties: [],
      range: { normal: 80, long: 320 },
    } as unknown as WeaponEquipment)

    expect(weaponEquipmentFormSchema.safeParse(weaponForm(stored)).success).toBe(true)
    expect(
      rangeIssue({ range: { normal: stored.range?.normal, long: stored.range?.normal } }),
    ).toBeDefined()
    expect(
      weaponEquipmentFormSchema.safeParse(
        weaponForm({ range: { normal: 400, long: stored.range?.long } }),
      ).success,
    ).toBe(false)
    expect(
      weaponEquipmentFormSchema.safeParse(
        weaponForm({ range: { normal: 20, long: stored.range?.normal } }),
      ).success,
    ).toBe(true)
  })
})
