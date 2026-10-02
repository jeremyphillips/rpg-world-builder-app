import { describe, expect, it } from 'vitest'

import {
  classPackageChoiceSchema,
  declineClassPackage,
  isClassPackageCustomized,
  normalizeClassPackageChoice,
  resolvePackageEntryQuantity,
  selectClassPackage,
  setPackageEntryQuantity,
} from './class-package-choice'

const option = {
  id: 'heavy-armor',
  label: 'Heavy Armor',
  items: [
    {
      id: 'javelin',
      kind: 'grant' as const,
      target: { source: 'equipment' as const, equipmentSlug: 'javelin' },
      quantity: 8,
    },
    {
      id: 'flail',
      kind: 'grant' as const,
      target: { source: 'equipment' as const, equipmentSlug: 'flail' },
      quantity: 1,
    },
  ],
}

describe('classPackageChoiceSchema', () => {
  it('rejects automatic intent that carries overrides', () => {
    expect(
      classPackageChoiceSchema.safeParse({
        state: 'selected',
        packageId: 'heavy-armor',
        intent: 'automatic',
        overrides: { entryQuantities: { javelin: 6 } },
      }).success,
    ).toBe(false)
  })
})

describe('package entry quantities', () => {
  it('clamps retained quantity and deletes the key at the authored default', () => {
    expect(resolvePackageEntryQuantity(8, 'javelin', { javelin: 6 })).toBe(6)
    expect(resolvePackageEntryQuantity(8, 'javelin', { javelin: 20 })).toBe(8)
    expect(resolvePackageEntryQuantity(8, 'javelin', undefined)).toBe(8)

    const reduced = setPackageEntryQuantity({
      entryId: 'javelin',
      authoredQuantity: 8,
      quantity: 6,
      overrides: {},
    })
    expect(reduced).toEqual({ javelin: 6 })
    expect(
      setPackageEntryQuantity({
        entryId: 'javelin',
        authoredQuantity: 8,
        quantity: 8,
        overrides: reduced,
      }),
    ).toEqual({})
  })

  it('drops unknown ids and default quantities during normalization', () => {
    const normalized = normalizeClassPackageChoice({
      choice: {
        ...selectClassPackage('heavy-armor', 'explicit'),
        overrides: { entryQuantities: { javelin: 6, missing: 0, flail: 1 } },
      },
      option,
    })

    expect(normalized).toEqual({
      state: 'selected',
      packageId: 'heavy-armor',
      intent: 'explicit',
      overrides: { entryQuantities: { javelin: 6 } },
    })
    expect(isClassPackageCustomized(normalized)).toBe(true)
    expect(isClassPackageCustomized(declineClassPackage())).toBe(false)
  })
})
