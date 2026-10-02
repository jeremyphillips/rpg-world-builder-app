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
            optionSatisfies: true,
            role: 'candidate',
          },
        ],
        [
          {
            requirementId: 'focus',
            owner: { kind: 'class', id: 'wizard' },
            rule: 'anyOf',
            optionSatisfies: true,
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
            optionSatisfies: true,
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

  it('keeps a strong recommendation when the row is not proficient and unaffordable', () => {
    const longsword = item('Longsword', {
      recommendation: {
        strength: 'strong',
        signals: [
          {
            strength: 'strong',
            basis: 'preference',
            specificity: 'exact',
            source: { kind: 'role', id: 'guard' },
          },
        ],
      },
      requirements: [],
      state: { compatibility: { proficient: false } },
      purchaseAvailability: { status: 'unaffordable', shortfallCp: 500 },
    })

    expect(longsword.state.resolved?.recommendation.strength).toBe('strong')
    expect(longsword.state.resolved?.recommendation.signals[0]?.source).toEqual({
      kind: 'role',
      id: 'guard',
    })
    expect(longsword.state.resolved?.state.compatibility?.proficient).toBe(false)
    expect(longsword.state.resolved?.purchaseAvailability).toEqual({
      status: 'unaffordable',
      shortfallCp: 500,
    })
  })

  it('ranks a strong item that cannot be bought ahead of a neutral item that can', () => {
    const context = {
      preferMartialWeaponBrowseOrder: false,
      rankPurchaseAvailability: true,
    }
    const required = item('Spellbook', {
      recommendation: { strength: 'strong', signals: [] },
      requirements: [
        {
          requirementId: 'spellbook',
          owner: { kind: 'class', id: 'wizard' },
          rule: 'exact',
          optionSatisfies: true,
          role: 'candidate',
        },
      ],
      state: {},
      purchaseAvailability: { status: 'unavailableForPurchase', reason: 'no_market_price' },
    })
    const neutral = item('Rope', {
      recommendation: { strength: 'neutral', signals: [] },
      requirements: [],
      state: {},
      purchaseAvailability: { status: 'available' },
    })

    expect(compareIntentionalEquipmentRanking(required, neutral, context)).toBeLessThan(0)
  })

  it('compares proficiency only when both rows define it', () => {
    const context = { preferMartialWeaponBrowseOrder: false, rankCompatibility: true }
    const proficient = weapon('Club', true)
    const untracked = weapon('Axe', undefined)
    const notProficient = weapon('Axe', false)
    const untrackedLater = weapon('Club', undefined)

    expect(compareIntentionalEquipmentRanking(proficient, untracked, context)).toBeGreaterThan(0)
    expect(compareIntentionalEquipmentRanking(notProficient, untrackedLater, context)).toBeLessThan(
      0,
    )
    expect(compareIntentionalEquipmentRanking(proficient, notProficient, context)).toBeLessThan(0)
  })
})

function weapon(name: string, proficient: boolean | undefined): EquipmentPickerItem {
  return item(
    name,
    {
      recommendation: { strength: 'neutral', signals: [] },
      requirements: [],
      state: proficient === undefined ? {} : { compatibility: { proficient } },
    },
    'weapon',
  )
}

function item(
  name: string,
  resolved: EquipmentPickerItem['state']['resolved'],
  kind: EquipmentPickerItem['equipment']['kind'] = 'adventuring_gear',
): EquipmentPickerItem {
  const purchaseAvailability = resolved?.purchaseAvailability ?? { status: 'available' as const }
  return {
    equipment: {
      id: name,
      name,
      slug: name.toLowerCase(),
      kind,
      ...(kind === 'weapon'
        ? { category: 'martial' as const, mode: 'melee' as const, properties: [] }
        : { gearKind: 'general' as const }),
    } as EquipmentPickerItem['equipment'],
    state: {
      isAvailable: true,
      isRecommended: false,
      disabledReasons: [],
      isProficient: resolved?.state.compatibility?.proficient ?? true,
      isWithinRemainingBudget: purchaseAvailability.status === 'available',
      purchaseAvailability,
      recommendation: { tier: 'neutral', reasons: [], specificity: 'broad_pool' },
      resolved,
    },
  }
}
