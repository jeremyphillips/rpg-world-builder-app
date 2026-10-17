import { describe, expect, it } from 'vitest'

import { resolveContentWeaponGrantOptionLabel } from './content-weapon-grant-option-label.lib'

describe('resolveContentWeaponGrantOptionLabel', () => {
  it('resolves by slug from visible equipment and catalog id', () => {
    expect(
      resolveContentWeaponGrantOptionLabel(
        'srd-cc-5.2.1:dagger',
        {
          equipment: {
            visible: [{ slug: 'srd-cc-5.2.1:dagger', name: 'Dagger', id: 'srd-cc-5.2.1:dagger' }],
          },
        } as never,
        new Map([['srd-cc-5.2.1:dagger', { name: 'Dagger from map' } as never]]),
      ),
    ).toBe('Dagger')
  })

  it('falls back to catalog map when not in visible reference list', () => {
    expect(
      resolveContentWeaponGrantOptionLabel(
        'srd-cc-5.2.1:dagger',
        undefined,
        new Map([
          ['srd-cc-5.2.1:dagger', { name: 'Dagger', slug: 'srd-cc-5.2.1:dagger' } as never],
        ]),
      ),
    ).toBe('Dagger')
  })
})
