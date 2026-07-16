import { describe, expect, it } from 'vitest'

import { DEFAULT_ARMOR_CLASS_BASE } from '../../../campaign/patches/campaign-mechanics-patch'

import { resolveArmorClassIfEquipped } from './preview-equipped-armor'

const leatherArmor = {
  category: 'light' as const,
  baseAc: 11,
  addDexModifier: true,
  maxDexBonus: undefined,
  acBonus: undefined,
}

const chainMail = {
  category: 'heavy' as const,
  baseAc: 16,
  addDexModifier: false,
  maxDexBonus: undefined,
  acBonus: undefined,
}

const shield = {
  category: 'shields' as const,
  baseAc: undefined,
  addDexModifier: false,
  maxDexBonus: undefined,
  acBonus: 2,
}

describe('resolveArmorClassIfEquipped', () => {
  it('replaces body armor when previewing a new suit', () => {
    expect(
      resolveArmorClassIfEquipped({
        acBase: DEFAULT_ARMOR_CLASS_BASE,
        dexModifier: 3,
        currentEquippedArmor: [leatherArmor],
        candidateArmor: chainMail,
      }),
    ).toBe(16)
  })

  it('stacks shields onto the current loadout', () => {
    expect(
      resolveArmorClassIfEquipped({
        acBase: DEFAULT_ARMOR_CLASS_BASE,
        dexModifier: 3,
        currentEquippedArmor: [leatherArmor],
        candidateArmor: shield,
      }),
    ).toBe(16)
  })
})
