import { describe, expect, it } from 'vitest'

import {
  compareActiveRequirement,
  compareContextRelevance,
  compareSourcePriority,
  compareStrength,
  resolveOptionContextRelevance,
} from '../../recommendation'
import type { EquipmentPickerItem } from '../picker/equipment-picker-item'
import { compareIntentionalEquipmentRanking } from './equipment-ranking-policy'

describe('equipment ranking primitives', () => {
  it('ranks unsatisfied exact requirements ahead of any-of candidates', () => {
    expect(
      compareActiveRequirement(
        [
          {
            requirementId: 'spellbook',
            owner: { kind: 'class', id: 'wizard' },
            rule: 'exact',
            role: 'candidate',
          },
        ],
        [
          {
            requirementId: 'focus',
            owner: { kind: 'class', id: 'wizard' },
            rule: 'anyOf',
            role: 'candidate',
          },
        ],
      ),
    ).toBeLessThan(0)
  })

  it('does not treat a satisfied focus candidate as an active requirement', () => {
    expect(
      compareActiveRequirement(
        [
          {
            requirementId: 'focus',
            owner: { kind: 'class', id: 'wizard' },
            rule: 'anyOf',
            role: 'satisfier',
          },
        ],
        [],
      ),
    ).toBe(0)
  })

  it('keeps context relevance inactive for the general drawer', () => {
    expect(
      resolveOptionContextRelevance({
        state: {
          choice: { inOpenPool: true, inSelectedPackage: false, inAlternativePackage: true },
        },
        activeChoice: { kind: 'none' },
      }),
    ).toBe('none')
    expect(compareContextRelevance('activeTarget', 'none')).toBeLessThan(0)
    expect(compareStrength('strong', 'compatible')).toBeLessThan(0)
    expect(compareSourcePriority('user', 'role')).toBeLessThan(0)
    expect(compareSourcePriority('role', 'class')).toBeLessThan(0)
    expect(compareSourcePriority('user', 'class')).toBeLessThan(0)
  })
})

describe('compareIntentionalEquipmentRanking', () => {
  it('does not lift an alternative-package row ahead of a soft recommendation in the general drawer', () => {
    const recommended = item('Longsword', {
      recommendation: {
        strength: 'strong',
        signals: [
          {
            strength: 'strong',
            basis: 'authored',
            specificity: 'exact',
            source: { kind: 'class', id: 'fighter' },
          },
        ],
      },
      requirements: [],
      state: {},
    })
    const alternative = item('Rope', {
      recommendation: { strength: 'neutral', signals: [] },
      requirements: [],
      state: {
        choice: { inOpenPool: false, inSelectedPackage: false, inAlternativePackage: true },
      },
    })

    expect(
      compareIntentionalEquipmentRanking(recommended, alternative, {
        preferMartialWeaponBrowseOrder: false,
        activeChoice: { kind: 'none' },
      }),
    ).toBeLessThan(0)
  })
})

function item(
  name: string,
  resolved: EquipmentPickerItem['state']['resolved'],
): EquipmentPickerItem {
  return {
    equipment: {
      id: name,
      name,
      slug: name.toLowerCase(),
      kind: 'adventuring_gear',
      gearKind: 'general',
    } as EquipmentPickerItem['equipment'],
    state: {
      isAvailable: true,
      isRecommended: false,
      disabledReasons: [],
      isProficient: true,
      isAffordable: true,
      isWithinRemainingBudget: true,
      purchaseAvailability: { status: 'available' },
      recommendation: { tier: 'neutral', reasons: [], specificity: 'broad_pool' },
      resolved,
    },
  }
}
