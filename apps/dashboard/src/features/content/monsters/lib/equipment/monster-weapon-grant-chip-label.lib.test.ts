import { describe, expect, it } from 'vitest'

import { resolveWeaponGrantChipLabel } from './monster-weapon-grant-chip-label.lib'

describe('resolveWeaponGrantChipLabel', () => {
  it('prefers visible equipment options', () => {
    expect(
      resolveWeaponGrantChipLabel('srd:dagger', {
        equipment: {
          visible: [{ slug: 'srd:dagger', name: 'Dagger' }],
        },
      } as never),
    ).toBe('Dagger')
  })

  it('falls back to slug when unresolved', () => {
    expect(resolveWeaponGrantChipLabel('unknown-slug')).toBe('unknown-slug')
  })
})
