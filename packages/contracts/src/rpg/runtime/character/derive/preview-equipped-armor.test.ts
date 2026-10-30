import { describe, expect, it } from 'vitest'

import { systemDefaultArmorClassRules } from '../../../campaign/patches/campaign-mechanics-patch'

import { toEquippedArmorPiece } from '../../creature/armor-class'

import { resolveArmorClassIfEquipped } from './preview-equipped-armor'

const leatherArmor = {
  category: 'light' as const,
  baseAcOffset: 1,
  acBonus: undefined,
}

const chainMail = {
  category: 'heavy' as const,
  baseAcOffset: 6,
  acBonus: undefined,
}

const shield = {
  category: 'shields' as const,
  acBonus: 2,
}

const rules = systemDefaultArmorClassRules()

describe('resolveArmorClassIfEquipped', () => {
  it('replaces body armor when previewing a new suit', () => {
    expect(
      resolveArmorClassIfEquipped({
        rules,
        dexModifier: 3,
        currentEquippedArmor: [toEquippedArmorPiece(leatherArmor)],
        candidateArmor: chainMail,
      }),
    ).toBe(16)
  })

  it('stacks shields onto the current loadout', () => {
    expect(
      resolveArmorClassIfEquipped({
        rules,
        dexModifier: 3,
        currentEquippedArmor: [toEquippedArmorPiece(leatherArmor)],
        candidateArmor: shield,
      }),
    ).toBe(16)
  })
})
